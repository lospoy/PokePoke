// IntentFeed
// Handles displaying all Intents

// Used in:
// ~../pages/index

import { LoadingPage } from "~/components/ui/loading";
import { IntentView } from "./intentView";
import { api } from "~/utils/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const IntentFeed = () => {
  const { data, isLoading: intentsLoading } = api.intents.getAll.useQuery();

  const activeIntents = data?.filter(
    (intent) => intent.intent.status === "ACTIVE",
  );
  const completedIntents = data?.filter(
    (intent) => intent.intent.status === "COMPLETED",
  );

  if (intentsLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <Tabs defaultValue="active" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="flex w-full flex-col space-y-4">
        {activeIntents?.map((fullIntent) => (
          <IntentView {...fullIntent} key={fullIntent.intent.id} />
        ))}
      </TabsContent>
      <TabsContent value="completed" className="flex w-full flex-col space-y-4">
        {completedIntents?.map((fullIntent) => (
          <IntentView {...fullIntent} key={fullIntent.intent.id} />
        ))}
      </TabsContent>
    </Tabs>
  );
};
