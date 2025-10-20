"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Target, Users, Clock } from "lucide-react";
import { api } from "~/trpc/react";

export default function CampaignsPage() {
 const { data, isLoading } = api.campaign.getAll.useQuery({ limit: 20 });

 return (
  <div className="min-h-screen container mx-auto px-4 py-8">
   <div className="max-w-7xl mx-auto">
    <div className="flex items-center gap-3 mb-6">
     <img src="/images/logo.png" alt="Knotable" className="h-6 w-6" />
     <h1 className="text-2xl font-bold text-white">Campaigns</h1>
    </div>

    {isLoading ? (
     <div className="text-center py-16 text-white/80">Loading campaigns…</div>
    ) : !data || data.campaigns.length === 0 ? (
     <Card>
      <CardContent className="text-center py-12">
       <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
       <h3 className="text-lg font-semibold text-white">No campaigns found</h3>
       <p className="text-white/70">Check back later for new campaigns.</p>
      </CardContent>
     </Card>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.campaigns.map((c) => (
       <Card key={c.id} className="border-white/10">
        <CardHeader>
         <CardTitle className="text-white">{c.title}</CardTitle>
         <CardDescription className="text-white/70">{c.description}</CardDescription>
        </CardHeader>
        <CardContent>
         <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
          <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" />{c._count.users} participants</span>
          <span className="inline-flex items-center gap-1"><Target className="w-4 h-4" />Level {c.startingBloomLevel} → {c.targetBloomLevel}</span>
          {c.estimatedDuration && (
           <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{c.estimatedDuration} days</span>
          )}
         </div>
         {c.focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
           {c.focusAreas.slice(0, 3).map((fa, i) => (
            <Badge key={i} variant="outline" className="text-xs">{fa}</Badge>
           ))}
           {c.focusAreas.length > 3 && (
            <Badge variant="outline" className="text-xs">+{c.focusAreas.length - 3} more</Badge>
           )}
          </div>
         )}
         <div className="mt-4 flex justify-end">
          <Button size="sm">View</Button>
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


