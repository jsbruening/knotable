"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Target, Users, Clock } from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function CampaignsPage() {
  const { data, isLoading } = api.campaign.getAll.useQuery({ limit: 20 });

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <img src="/images/logo.png" alt="Knotable" className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-white/80">
            Loading campaigns…
          </div>
        ) : !data || data.campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="mx-auto mb-4 h-12 w-12 text-white/40" />
              <h3 className="text-lg font-semibold text-white">
                No campaigns found
              </h3>
              <p className="text-white/70">
                Check back later for new campaigns.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.campaigns.map((c) => (
              <Card key={c.id} className="border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">{c.title}</CardTitle>
                  <CardDescription className="text-white/70">
                    {c.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {c._count.users} participants
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Level {c.startingBloomLevel} → {c.targetBloomLevel}
                    </span>
                    {c.estimatedDuration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {c.estimatedDuration} days
                      </span>
                    )}
                  </div>
                  {c.focusAreas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.focusAreas.slice(0, 3).map((fa, i) => (
                        <Badge key={i} variant="glass" className="text-xs">
                          {fa}
                        </Badge>
                      ))}
                      {c.focusAreas.length > 3 && (
                        <Badge variant="glass" className="text-xs">
                          +{c.focusAreas.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" asChild>
                      <Link href={`/campaigns/${c.id}`}>View</Link>
                    </Button>
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
