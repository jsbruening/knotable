"use client";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Trophy, Star, Users, Target, Zap, Gift } from "lucide-react";

interface QuickTourProps {
 onNext: (data: any) => void;
 onPrevious: () => void;
 data: any;
 isFirstStep: boolean;
 isLastStep: boolean;
}

export function QuickTour({ onNext, onPrevious }: QuickTourProps) {
 const router = useRouter();
 const completeOnboarding = api.auth.completeOnboarding.useMutation();
 const handleComplete = async () => {
  try {
   await completeOnboarding.mutateAsync({});
   onNext({ onboardingCompleted: true });
   router.push("/dashboard");
  } catch (err) {
   // Fallback: proceed even if network hiccups, user can access dashboard
   onNext({ onboardingCompleted: true });
   router.push("/dashboard");
  }
 };

 const features = [
  {
   icon: <Target className="w-6 h-6 text-blue-600" />,
   title: "Campaigns",
   description: "Join AI-generated learning campaigns structured around Bloom's Taxonomy",
   color: "bg-blue-50 border-blue-200",
  },
  {
   icon: <Users className="w-6 h-6 text-green-600" />,
   title: "Teams",
   description: "Collaborate with others, participate in team challenges, and chat in real-time",
   color: "bg-green-50 border-green-200",
  },
  {
   icon: <Star className="w-6 h-6 text-yellow-600" />,
   title: "Kudos System",
   description: "Give and receive kudos with 'I owe you a beverage' and 'Kudo Bomb' features",
   color: "bg-yellow-50 border-yellow-200",
  },
  {
   icon: <Trophy className="w-6 h-6 text-purple-600" />,
   title: "Badges & Points",
   description: "Earn badges for achievements and points for completing milestones",
   color: "bg-purple-50 border-purple-200",
  },
  {
   icon: <Gift className="w-6 h-6 text-pink-600" />,
   title: "Unlockables",
   description: "Spend points on profile themes, avatars, skip tokens, and secret campaigns",
   color: "bg-pink-50 border-pink-200",
  },
  {
   icon: <Zap className="w-6 h-6 text-orange-600" />,
   title: "Gamification",
   description: "Level up through Bloom's Taxonomy levels and compete on leaderboards",
   color: "bg-orange-50 border-orange-200",
  },
 ];

 return (
  <div className="space-y-6">
   <div className="text-center">
    <h3 className="text-xl font-semibold mb-2">Welcome to Knotable! 🎉</h3>
    <p className="text-gray-600">
     Here's what you can do on your learning journey
    </p>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {features.map((feature, index) => (
     <Card key={index} className={`${feature.color} border-2`}>
      <CardHeader className="pb-3">
       <div className="flex items-center space-x-3">
        {feature.icon}
        <CardTitle className="text-lg">{feature.title}</CardTitle>
       </div>
      </CardHeader>
      <CardContent>
       <CardDescription className="text-sm">
        {feature.description}
       </CardDescription>
      </CardContent>
     </Card>
    ))}
   </div>

   {/* Key Stats Preview */}
   <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
    <CardHeader>
     <CardTitle className="text-center">Your Learning Dashboard</CardTitle>
     <CardDescription className="text-center">
      Track your progress and achievements
     </CardDescription>
    </CardHeader>
    <CardContent>
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div>
       <div className="text-2xl font-bold text-blue-600">0</div>
       <div className="text-sm text-gray-600">Points</div>
      </div>
      <div>
       <div className="text-2xl font-bold text-green-600">0</div>
       <div className="text-sm text-gray-600">Kudos</div>
      </div>
      <div>
       <div className="text-2xl font-bold text-purple-600">0</div>
       <div className="text-sm text-gray-600">Badges</div>
      </div>
      <div>
       <div className="text-2xl font-bold text-orange-600">1</div>
       <div className="text-sm text-gray-600">Day Streak</div>
      </div>
     </div>
    </CardContent>
   </Card>

   {/* Fun Facts */}
   <Card>
    <CardHeader>
     <CardTitle className="text-center">Fun Learning Facts</CardTitle>
    </CardHeader>
    <CardContent>
     <div className="space-y-3 text-sm">
      <div className="flex items-center space-x-2">
       <Badge variant="outline">💡</Badge>
       <span>Complete milestones to earn points and unlock new features</span>
      </div>
      <div className="flex items-center space-x-2">
       <Badge variant="outline">🎯</Badge>
       <span>Give kudos to teammates - it's like saying "I owe you a beverage!"</span>
      </div>
      <div className="flex items-center space-x-2">
       <Badge variant="outline">🚀</Badge>
       <span>Use skip tokens to bypass difficult quizzes when you're stuck</span>
      </div>
      <div className="flex items-center space-x-2">
       <Badge variant="outline">🎨</Badge>
       <span>Unlock profile themes and avatars to personalize your experience</span>
      </div>
     </div>
    </CardContent>
   </Card>

   <div className="flex justify-between">
    <Button onClick={onPrevious} variant="outline">
     Back
    </Button>
    <Button onClick={handleComplete} className="px-8">
     Complete Setup & Start Learning! 🚀
    </Button>
   </div>
  </div>
 );
}

