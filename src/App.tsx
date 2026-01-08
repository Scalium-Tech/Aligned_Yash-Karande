import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { FocusTimerProvider } from "@/contexts/FocusTimerContext";
import { NotificationScheduler } from "@/components/NotificationScheduler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/PageLoader";

// Eagerly load critical pages (landing, auth)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Lazy load less critical pages for better initial bundle size
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Careers = lazy(() => import("./pages/Careers"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Feedback = lazy(() => import("./pages/Feedback"));

// Lazy load dashboard (heaviest page)
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Lazy load onboarding steps
const OnboardingStep1 = lazy(() => import("./pages/onboarding/Step1"));
const OnboardingStep2 = lazy(() => import("./pages/onboarding/Step2"));
const OnboardingStep3 = lazy(() => import("./pages/onboarding/Step3"));
const OnboardingStep4 = lazy(() => import("./pages/onboarding/Step4"));
const OnboardingStep5 = lazy(() => import("./pages/onboarding/Step5"));
const OnboardingStep6 = lazy(() => import("./pages/onboarding/Step6"));
const OnboardingStep7 = lazy(() => import("./pages/onboarding/Step7"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <FocusTimerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <NotificationScheduler />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Critical routes (eagerly loaded) */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Lazy loaded routes */}
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/shipping" element={<ShippingPolicy />} />
                    <Route path="/refunds" element={<RefundPolicy />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Dashboard (heavy, lazy loaded) */}
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Onboarding steps (lazy loaded) */}
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
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </FocusTimerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
