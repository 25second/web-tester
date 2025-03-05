import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formAnalyzer } from "@/lib/formAnalysis";
import { Progress } from "@/components/ui/progress";

const stepOneSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
});

const stepTwoSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short"),
});

const stepThreeSchema = z.object({
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City name is too short"),
});

type FormData = z.infer<typeof stepOneSchema> &
  z.infer<typeof stepTwoSchema> &
  z.infer<typeof stepThreeSchema>;

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [formMetrics, setFormMetrics] = useState({
    averageTimePerField: 0,
    correctionRate: 0,
    backspaceRate: 0,
    naturalness: 1
  });

  const form = useForm<Partial<FormData>>({
    resolver: zodResolver(
      step === 1
        ? stepOneSchema
        : step === 2
        ? stepTwoSchema
        : stepThreeSchema
    ),
    defaultValues: formData,
  });

  useEffect(() => {
    // Reset form analyzer when form is reset
    return () => {
      formAnalyzer.reset();
    };
  }, []);

  const onSubmit = (data: Partial<FormData>) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);

    // Analyze form behavior before moving to next step
    const metrics = formAnalyzer.analyzeFormBehavior();
    setFormMetrics(metrics);

    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log("Final form data:", newFormData);
      console.log("Form behavior metrics:", metrics);
      // Reset form
      setStep(1);
      setFormData({});
      form.reset();
      formAnalyzer.reset();
    }
  };

  const handleInputFocus = (fieldName: string) => {
    formAnalyzer.startFieldTracking(fieldName);
  };

  const handleInputBlur = (fieldName: string) => {
    formAnalyzer.endFieldTracking(fieldName);
  };

  const handleKeyDown = (fieldName: string, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      formAnalyzer.recordBackspace(fieldName);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-step Form (Step {step} of 3)</CardTitle>
        <CardDescription>
          Form Behavior Analysis
        </CardDescription>
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span>Naturalness Score:</span>
            <span>{(formMetrics.naturalness * 100).toFixed(1)}%</span>
          </div>
          <Progress value={formMetrics.naturalness * 100} />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          onFocus={() => handleInputFocus('firstName')}
                          onBlur={() => handleInputBlur('firstName')}
                          onKeyDown={(e) => handleKeyDown('firstName', e)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          onFocus={() => handleInputFocus('lastName')}
                          onBlur={() => handleInputBlur('lastName')}
                          onKeyDown={(e) => handleKeyDown('lastName', e)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          {...field}
                          onFocus={() => handleInputFocus('email')}
                          onBlur={() => handleInputBlur('email')}
                          onKeyDown={(e) => handleKeyDown('email', e)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          {...field}
                          onFocus={() => handleInputFocus('phone')}
                          onBlur={() => handleInputBlur('phone')}
                          onKeyDown={(e) => handleKeyDown('phone', e)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 3 && (
              <>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          onFocus={() => handleInputFocus('address')}
                          onBlur={() => handleInputBlur('address')}
                          onKeyDown={(e) => handleKeyDown('address', e)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          onFocus={() => handleInputFocus('city')}
                          onBlur={() => handleInputBlur('city')}
                          onKeyDown={(e) => handleKeyDown('city', e)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button type="submit">
                {step === 3 ? "Submit" : "Next"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}