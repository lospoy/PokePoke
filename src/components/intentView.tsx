// IntentView
// Handles displaying a single Intent

// Used in:
// ~/intentFeed

import { api, type RouterOutputs } from "~/utils/api";
import { AimViewById } from "./aimViewById";
import { useCallback, useEffect, useState } from "react";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card } from "./ui/card";

type IntentWithUser = RouterOutputs["intents"]["getAll"][number];

export const IntentView = (props: IntentWithUser) => {
  const { intent } = props;
  const { mutateAsync } = api.intents.softDelete.useMutation();

  const [progress, setProgress] = useState(5);

  const startDate = intent.startDate.toLocaleDateString();
  const endDate = intent.endDate.toLocaleDateString();
  const dates = `${startDate} - ${endDate}`;

  async function handleDeleteClick() {
    try {
      console.warn("Soft Delete successful");
      await mutateAsync({ id: intent.id });
    } catch (error) {
      console.error("Error during soft delete:", error);
    }
  }

  const calculateProgress = useCallback(() => {
    // Calculates how far along this intent the user is based on daysSinceStart/totalDays
    // Will be changed in the future, this is a simplistic approach
    const start = intent.startDate;
    const end = intent.endDate;
    const today = new Date();
    const convertMsToDays = (ms: number) => {
      return Math.floor(ms / (1000 * 60 * 60 * 24));
    };
    const totalDays = convertMsToDays(end.getTime() - start.getTime());
    const daysSinceStart = convertMsToDays(today.getTime() - start.getTime());
    const percentageCompleted = Math.floor((daysSinceStart / totalDays) * 100);

    // forcing max percentage to 100
    return percentageCompleted > 100 ? 100 : percentageCompleted;
  }, [intent]);

  useEffect(() => {
    setProgress(calculateProgress());
  }, [calculateProgress]);

  return (
    <Card key={intent.id} className="flex">
      <div className="flex w-full flex-col">
        <Dialog>
          <DialogTrigger>
            <div className="flex flex-col">
              <Progress
                value={progress}
                className="-mb-2 rounded-xl rounded-b-none"
              />
              <div className="p-3">
                <AimViewById aimId={intent.aimId} />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <AimViewById aimId={intent.aimId} />
              <Progress
                value={progress}
                id="progress"
                className="h-5 rounded-md"
              />
            </DialogHeader>
            <div className="gap-4 py-4">
              <div className="mb-3 space-y-1">
                <Label htmlFor="reminders">Reminders</Label>
                <Input
                  id="reminders"
                  autoFocus={false}
                  defaultValue={intent.reminders}
                />
              </div>
              <div className="mb-3 space-y-1">
                <Label htmlFor="dates">Dates</Label>
                <Input
                  id="dates"
                  type="date"
                  autoFocus={false}
                  defaultValue={dates}
                />
              </div>
              {intent.notes && (
                <div className="mb-3 space-y-1">
                  <Label htmlFor="dates">Notes</Label>
                  <Input id="dates" defaultValue={intent.notes} />
                </div>
              )}
            </div>
            <DialogFooter>
              {intent.status !== "COMPLETED" && (
                <Button
                  className="w-2/5 self-center"
                  onClick={handleDeleteClick}
                  variant="destructive"
                >
                  Delete Intent
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
