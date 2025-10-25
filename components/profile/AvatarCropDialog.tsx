'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { materialAPI } from '@/lib/api/materialAPI';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploaded: (fileUrl: string) => void; 
};

type Area = { x: number; y: number; width: number; height: number };

export default function AvatarCropDialog({ open, onOpenChange, onUploaded }: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedPixels(areaPixels);
  }, []);

  const pickFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const resetState = useCallback(() => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedPixels(null);
    setWorking(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (e) => reject(e));
      img.setAttribute('crossOrigin', 'anonymous'); // tránh CORS khi toDataURL
      img.src = url;
    });

  const getCroppedBlob = useCallback(
    async (src: string, cropPx: Area, rotationDeg = 0): Promise<Blob> => {
      const image = await createImage(src);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const safeArea = Math.max(image.width, image.height) * 2;
      canvas.width = safeArea;
      canvas.height = safeArea;

      // translate to center & rotate
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotationDeg * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);

      // vẽ ảnh vào giữa vùng an toàn
      ctx.drawImage(
        image,
        (safeArea - image.width) / 2,
        (safeArea - image.height) / 2
      );

      // crop ra ảnh vuông theo area
      const data = ctx.getImageData(
        (safeArea - image.width) / 2 + cropPx.x,
        (safeArea - image.height) / 2 + cropPx.y,
        cropPx.width,
        cropPx.height
      );

      // set canvas về đúng kích thước crop (avatar 512x512 cho đẹp)
      const outSize = 512;
      canvas.width = outSize;
      canvas.height = outSize;

      // dán dữ liệu crop vào 1 canvas tạm (để scale mượt)
      const tmp = document.createElement('canvas');
      tmp.width = cropPx.width;
      tmp.height = cropPx.height;
      const tctx = tmp.getContext('2d')!;
      tctx.putImageData(data, 0, 0);

      // scale sang outSize
      ctx.clearRect(0, 0, outSize, outSize);
      ctx.drawImage(tmp, 0, 0, outSize, outSize);

      return await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob as Blob), 'image/jpeg', 0.92)
      );
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (!imageSrc || !croppedPixels) {
      toast({ title: 'Chưa có ảnh', description: 'Hãy chọn ảnh trước.', variant: 'destructive' });
      return;
    }
    setWorking(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedPixels, rotation);
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      // Upload qua materialAPI -> /material/images
      const res = await materialAPI.uploadImage(file, {
        title: 'avatar', // bạn có thể đổi title nếu muốn
        description: 'user avatar',
      });

      onUploaded(res.fileUrl);
      toast({ title: 'Đã cập nhật ảnh đại diện' });
      onOpenChange(false);
      // reset sau khi đóng
      setTimeout(() => resetState(), 0);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Upload thất bại',
        description: 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setWorking(false);
    }
  }, [croppedPixels, getCroppedBlob, imageSrc, onOpenChange, onUploaded, rotation, toast, resetState]);

  const body = useMemo(() => {
    if (!imageSrc) {
      return (
        <div className="space-y-3">
          <Label htmlFor="avatar-file">Chọn ảnh (JPG/PNG)</Label>
          <Input
            id="avatar-file"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={pickFile}
          />
          <p className="text-xs text-muted-foreground">
            Gợi ý: dùng ảnh tối thiểu 512×512 để sắc nét.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="relative w-full h-[360px] rounded-lg overflow-hidden bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            restrictPosition
            zoomWithScroll
            showGrid={false}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div>
            <Label className="mb-1 block">Zoom</Label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={(v) => setZoom(v[0])}
            />
          </div>
          <div>
            <Label className="mb-1 block">Rotation</Label>
            <Slider
              value={[rotation]}
              min={-180}
              max={180}
              step={1}
              onValueChange={(v) => setRotation(v[0])}
            />
          </div>
          <div className="flex items-end justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetState} disabled={working}>
              Chọn ảnh khác
            </Button>
            <Button type="button" onClick={handleUpload} disabled={working}>
              {working ? 'Đang xử lý…' : 'Lưu ảnh'}
            </Button>
          </div>
        </div>
      </div>
    );
  }, [crop, handleUpload, imageSrc, pickFile, resetState, rotation, zoom]);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetState(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
          <DialogDescription>
            Tải ảnh của bạn, điều chỉnh khung cắt (1:1), và lưu để cập nhật avatar.
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}