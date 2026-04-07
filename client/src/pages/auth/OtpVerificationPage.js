import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthAlert from "../../components/authentication/AuthAlert";
import AuthShell from "../../components/authentication/AuthShell";
import OtpInput from "../../components/authentication/OtpInput";
import Button from "../../components/ui/Button";
import useAuth from "../../hooks/useAuth";
import {
  getApiErrorMessage,
  sendOtp,
  verifyAccount,
} from "../../services/authService";

const RESEND_COOLDOWN_SECONDS = 30;
const AUTO_SEND_THROTTLE_MS = 5000;
const OTP_AUTO_SEND_KEY = "rescuenet:otp-auto-send-ts";

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const { user, refreshSession, resolvePostAuthRoute } = useAuth();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const didAutoSendRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const triggerOtpSend = useCallback(
    async (isAutomatic = false) => {
      if (sendingOtp || cooldown > 0) {
        return;
      }

      setSendingOtp(true);
      setError("");

      try {
        await sendOtp();
        setStatus(
          isAutomatic
            ? "Verification code sent. Check your inbox."
            : "A new verification code has been sent.",
        );
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } catch (requestError) {
        setError(
          getApiErrorMessage(requestError, "Could not send OTP. Please try again."),
        );
      } finally {
        setSendingOtp(false);
      }
    },
    [cooldown, sendingOtp],
  );

  useEffect(() => {
    if (didAutoSendRef.current) {
      return;
    }

    const previousSend = Number(sessionStorage.getItem(OTP_AUTO_SEND_KEY) || 0);
    const now = Date.now();
    if (previousSend && now - previousSend < AUTO_SEND_THROTTLE_MS) {
      didAutoSendRef.current = true;
      return;
    }

    didAutoSendRef.current = true;
    sessionStorage.setItem(OTP_AUTO_SEND_KEY, String(now));
    triggerOtpSend(true);
  }, [triggerOtpSend]);

  const otpError = useMemo(() => {
    if (!otp) {
      return "";
    }

    return /^\d{6}$/.test(otp) ? "" : "OTP must be exactly 6 numeric digits.";
  }, [otp]);

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit numeric code.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      await verifyAccount(otp);
      const session = await refreshSession();
      navigate(resolvePostAuthRoute(session), { replace: true });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "OTP verification failed. Please check the code and try again.",
        ),
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthShell
      title="Verify Your Account"
      subtitle="Account verification is mandatory before login and dashboard access."
      footer={
        <p className="text-xs text-auth-text-muted">
          Logged in as <span className="text-primary-container font-semibold">{user?.email || "current user"}</span>
        </p>
      }
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <AuthAlert message={error} variant="error" />
        <AuthAlert message={status} variant="success" />

        <OtpInput value={otp} onChange={setOtp} disabled={verifying} />
        {otpError ? (
          <p className="text-xs" style={{ color: "var(--danger)" }}>
            {otpError}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => triggerOtpSend(false)}
            disabled={sendingOtp || cooldown > 0}
            className="w-full py-3 text-sm font-semibold disabled:opacity-70"
          >
            {sendingOtp
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend OTP"}
          </Button>

          <Button
            type="submit"
            disabled={verifying || Boolean(otpError) || otp.length !== 6}
            className="w-full py-3 text-sm font-semibold disabled:opacity-70"
          >
            {verifying ? "Verifying..." : "Verify Account"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
