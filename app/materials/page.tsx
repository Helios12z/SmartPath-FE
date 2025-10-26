// 'use client';

// import { Navbar } from '@/components/layout/Navbar';
// import { Sidebar } from '@/components/layout/Sidebar';
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { PlusCircle, FileText, Download } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import Link from 'next/link';
// import { useToast } from '@/hooks/use-toast';

// export default function MaterialsPage() {
//   const { toast } = useToast();

//   const materialsWithDetails = mockMaterials.map(material => {
//     const uploader = mockUsers.find(u => u.id === material.uploader_id);
//     const relatedPost = material.post_id ? mockPosts.find(p => p.id === material.post_id) : null;
//     return {
//       ...material,
//       uploader,
//       relatedPost
//     };
//   });

//   const handleDownload = (material: any) => {
//     toast({
//       title: 'Download Started',
//       description: `Downloading ${material.title}`,
//     });
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
//       <Navbar />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
//           <div className="space-y-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-3xl font-bold">Study Materials</h1>
//                 <p className="text-muted-foreground">Access and share learning resources</p>
//               </div>
//               <Button>
//                 <PlusCircle className="mr-2 h-4 w-4" />
//                 Upload Material
//               </Button>
//             </div>

//             <div className="grid gap-4">
//               {materialsWithDetails.map((material) => (
//                 <Card key={material.id}>
//                   <CardHeader>
//                     <div className="flex items-start justify-between">
//                       <div className="flex items-start gap-3 flex-1">
//                         <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
//                           <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="text-lg font-semibold mb-1">{material.title}</h3>
//                           <p className="text-sm text-muted-foreground mb-3">{material.description}</p>

//                           <div className="flex items-center gap-4 text-sm">
//                             <div className="flex items-center gap-2">
//                               <Avatar className="h-6 w-6">
//                                 <AvatarImage src={material.uploader?.avatar_url} alt={material.uploader?.full_name} />
//                                 <AvatarFallback>{material.uploader?.full_name.charAt(0)}</AvatarFallback>
//                               </Avatar>
//                               <Link
//                                 href={`/profile/${material.uploader?.id}`}
//                                 className="hover:underline"
//                               >
//                                 {material.uploader?.full_name}
//                               </Link>
//                             </div>
//                             <Badge variant="secondary">
//                               {formatDistanceToNow(new Date(material.uploaded_at), { addSuffix: true })}
//                             </Badge>
//                             {material.relatedPost && (
//                               <Link
//                                 href={`/forum/${material.post_id}`}
//                                 className="text-blue-600 hover:underline"
//                               >
//                                 View Related Post
//                               </Link>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDownload(material)}
//                       >
//                         <Download className="mr-2 h-4 w-4" />
//                         Download
//                       </Button>
//                     </div>
//                   </CardHeader>
//                 </Card>
//               ))}
//             </div>

//             {materialsWithDetails.length === 0 && (
//               <Card>
//                 <CardContent className="p-12 text-center">
//                   <p className="text-muted-foreground">No materials available yet</p>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
