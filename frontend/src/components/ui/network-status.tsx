"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      setShowIndicator(true);
      setIsExpanded(true);

      // Stop syncing after 2 seconds
      setTimeout(() => {
        setIsSyncing(false);
      }, 2000);

      // Hide indicator after 4 seconds total
      setTimeout(() => {
        setShowIndicator(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
      setShowIndicator(true);
      setIsExpanded(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!showIndicator) return;

    setIsExpanded(true);
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showIndicator, isOnline]);

  if (!showIndicator) return null;

  const getStyles = () => {
    if (!isOnline) {
      return {
        bg: "bg-yellow-500 text-white",
        hover: "hover:bg-yellow-600",
      };
    }
    if (isSyncing) {
      return {
        bg: "bg-green-500 text-white",
        hover: "hover:bg-green-600",
      };
    }
    return {
      bg: "bg-green-500 text-white",
      hover: "hover:bg-green-600",
    };
  };

  const getIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 shrink-0" />;
    }
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />;
    }
    return <Wifi className="h-4 w-4 shrink-0" />;
  };

  const getMessage = () => {
    if (!isOnline) {
      return "Changes won't sync";
    }
    if (isSyncing) {
      return "Syncing changes...";
    }
    return "Back online";
  };

  const styles = getStyles();

  return (
    <motion.button
      className={`fixed top-3 md:top-4 right-10 md:right-4 z-50 ${styles.bg} rounded-full shadow-lg ${styles.hover} flex items-center gap-2 overflow-hidden transition-colors`}
      animate={{
        paddingLeft: isExpanded && !isSyncing ? "1rem" : "0.5rem",
        paddingRight: isExpanded && !isSyncing ? "1rem" : "0.5rem",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {getIcon()}
      <AnimatePresence>
        {isExpanded && !isSyncing ? (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-xs font-medium whitespace-nowrap"
          >
            {getMessage()}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <span className="sr-only">{getMessage()}</span>
    </motion.button>
  );
}
