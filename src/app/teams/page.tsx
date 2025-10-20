"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Users, MessageCircle } from "lucide-react";
import { api } from "~/trpc/react";

export default function TeamsPage() {
 const { data, isLoading } = api.team.getAll.useQuery({ limit: 20 });

 return (
  <div className="min-h-screen container mx-auto px-4 py-8">
   <div className="max-w-7xl mx-auto">
    <div className="flex items-center gap-3 mb-6">
     <img src="/images/logo.png" alt="Knotable" className="h-6 w-6" />
     <h1 className="text-2xl font-bold text-white">Teams</h1>
    </div>

    {isLoading ? (
     <div className="text-center py-16 text-white/80">Loading teams…</div>
    ) : !data || data.teams.length === 0 ? (
     <Card>
      <CardContent className="text-center py-12">
       <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
       <h3 className="text-lg font-semibold text-white">No teams found</h3>
       <p className="text-white/70">Create a new team from the onboarding flow or future Teams UI.</p>
      </CardContent>
     </Card>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.teams.map((t) => (
       <Card key={t.id} className="border-white/10">
        <CardHeader>
         <CardTitle className="text-white">{t.name}</CardTitle>
         <CardDescription className="text-white/70">{t.description || "No description"}</CardDescription>
        </CardHeader>
        <CardContent>
         <div className="flex items-center justify-between text-sm text-white/80">
          <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" />{t._count.members} members</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" />Team chat</span>
         </div>
         <div className="mt-4 flex justify-end">
          <Button size="sm" variant="outline">Open</Button>
         </div>
        </CardContent>
       </Card>
      ))}
     </div>
    )}
   </div>
  </div>
 );
}


