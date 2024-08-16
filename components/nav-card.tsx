import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const NavCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fast Access</CardTitle>
        <CardDescription className="text-sm">
          Create a new project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">Create</Button>
      </CardContent>
    </Card>
  );
};
