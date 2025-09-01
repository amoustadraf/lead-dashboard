import { Button } from "@/components/ui/button";

export default function SendEmailsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <h1 className="text-4xl font-bold">Send Emails Page</h1>
      <p className="text-lg mt-4">This is where you will send emails to your clients.</p>
      <div className="flex space-x-4 mt-6">
        <Button>Generate Personalized Emails</Button>
        <Button variant="outline">View Email Templates</Button>
      </div>
    </div>
  );
}
