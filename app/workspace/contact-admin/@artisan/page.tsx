"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_PHONE_NUMBER } from "@/lib/utils";
import { CheckCircle, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function ContactAdminPage() {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/admin-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setSubject("");
        setMessage("");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  const handleGoToMessages = () => {
    router.push("/workspace/messages");
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-[#DDDDDD] shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#222222] mb-2">
            Message envoyé !
          </h2>
          <p className="text-[#717171] mb-6">
            Une conversation a été créée avec un administrateur. Nous vous
            répondrons rapidement.
          </p>
          <Button
            onClick={handleGoToMessages}
            className="w-full bg-fixeo-main-500 hover:bg-fixeo-main-600 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Accéder aux conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Section - Contact Information */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-[#717171] uppercase tracking-wide mb-2">
              Get in touch with us
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#222222] mb-4">
              Need a Help? Get in touch with us!
            </h1>
          </div>

          {/* Contact Cards */}
          <div className="space-y-4">
            {/* Phone Contact */}
            <div className="bg-white rounded-xl border border-[#DDDDDD] shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-fixeo-main-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-fixeo-main-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#222222] mb-2">
                    Don't hesitate to reach out!
                  </h3>
                  <p className="text-sm text-[#717171] mb-1">
                    Phone : {ADMIN_PHONE_NUMBER}
                  </p>
                  <p className="text-sm text-[#717171]">Fax : 310-1298-4836</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl border border-[#DDDDDD] shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-fixeo-main-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-fixeo-main-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#222222] mb-2">
                    Ready for some coffee?
                  </h3>
                  <p className="text-sm text-[#717171]">
                    401 Broadway, 24th floor
                  </p>
                  <p className="text-sm text-[#717171]">Church View, London</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl border border-[#DDDDDD] shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-fixeo-main-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-fixeo-main-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#222222] mb-2">
                    How can we assist you?
                  </h3>
                  <p className="text-sm text-[#717171]">johndoe@gmail.com</p>
                  <p className="text-sm text-[#717171]">smithjohn@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Contact Form */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white rounded-xl border border-[#DDDDDD] shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-6">
              Say hello!
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Subject Field */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-[#222222]">
                  Sujet
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Entrez le sujet de votre demande..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSending}
                  required
                  className="border-[#DDDDDD] focus:border-fixeo-main-500 focus:ring-fixeo-main-500"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-[#222222]">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Entrez votre message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSending}
                  required
                  rows={6}
                  className="border-[#DDDDDD] focus:border-fixeo-main-500 focus:ring-fixeo-main-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!subject.trim() || !message.trim() || isSending}
                className="w-full bg-[#222222] hover:bg-[#000000] text-white py-6 text-base font-medium"
              >
                {isSending ? "Envoi en cours..." : "Envoyer la demande"}
              </Button>

              {/* Privacy Policy Text */}
              <p className="text-sm text-[#717171] text-center">
                I understand that my data will be hold securely in accordance
                with the{" "}
                <span className="text-[#222222] font-medium underline cursor-pointer">
                  privacy policy
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
