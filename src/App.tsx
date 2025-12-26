import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { FocusTimerProvider } from "@/contexts/FocusTimerContext";
import { NotificationScheduler } from "@/components/NotificationScheduler";
import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Careers from "./pages/Careers";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OnboardingStep1 from "./pages/onboarding/Step1";
import OnboardingStep2 from "./pages/onboarding/Step2";
import OnboardingStep3 from "./pages/onboarding/Step3";
import OnboardingStep4 from "./pages/onboarding/Step4";
import OnboardingStep5 from "./pages/onboarding/Step5";
import OnboardingStep6 from "./pages/onboarding/Step6";
import OnboardingStep7 from "./pages/onboarding/Step7";
import Feedback from "./pages/Feedback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <FocusTimerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NotificationScheduler />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/onboarding/step-1" element={<OnboardingStep1 />} />
                <Route path="/onboarding/step-2" element={<OnboardingStep2 />} />
                <Route path="/onboarding/step-3" element={<OnboardingStep3 />} />
                <Route path="/onboarding/step-4" element={<OnboardingStep4 />} />
                <Route path="/onboarding/step-5" element={<OnboardingStep5 />} />
                <Route path="/onboarding/step-6" element={<OnboardingStep6 />} />
                <Route path="/onboarding/step-7" element={<OnboardingStep7 />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FocusTimerProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
