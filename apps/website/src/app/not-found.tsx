import { Button } from "@/components/shared";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal-100 text-teal-600 mb-6">
            <span className="text-5xl font-bold">404</span>
          </div>
        </div>

        <h1 className="text-h2 text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-body-lg text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
          <Button href="/contact" variant="outline" size="lg">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
