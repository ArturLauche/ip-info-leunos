"use client";

import { useEffect, useState } from "react";
import { InfoCard } from "@/components/info-card";
import {
  Globe,
  MapPin,
  Building2,
  Clock,
  Wifi,
  Hash,
  Map,
  Copy,
  Check,
} from "lucide-react";

interface IpData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

export function IpDisplay() {
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/ip")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    if (!data?.ip) return;
    await navigator.clipboard.writeText(data.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-32 animate-pulse rounded-md bg-secondary" />
          <div className="h-12 w-72 animate-pulse rounded-lg bg-secondary" />
        </div>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-secondary"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-center text-muted-foreground">
        Unable to retrieve your IP information.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10">
      {/* IP Address Hero */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Your IP Address
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl font-mono">
            {data.ip}
          </h1>
          <button
            onClick={handleCopy}
            className="rounded-lg border border-border bg-secondary p-2.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
            aria-label="Copy IP address"
          >
            {copied ? (
              <Check className="h-5 w-5 text-primary" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
        {data.city !== "Unknown" && (
          <p className="text-base text-muted-foreground">
            {data.city}, {data.regionName}, {data.country}
          </p>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          icon={MapPin}
          label="Location"
          value={
            data.city !== "Unknown"
              ? `${data.city}, ${data.regionName}`
              : "Unknown"
          }
          detail={data.country}
        />
        <InfoCard
          icon={Globe}
          label="Country"
          value={data.country}
          detail={data.countryCode}
        />
        <InfoCard
          icon={Clock}
          label="Timezone"
          value={data.timezone}
          detail="IANA timezone"
        />
        <InfoCard
          icon={Wifi}
          label="ISP"
          value={data.isp}
          detail="Internet Service Provider"
        />
        <InfoCard
          icon={Building2}
          label="Organization"
          value={data.org}
          detail="Network organization"
        />
        <InfoCard
          icon={Hash}
          label="AS Number"
          value={data.as}
          detail="Autonomous System"
        />
        <InfoCard
          icon={Map}
          label="Coordinates"
          value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`}
          detail="Latitude, Longitude"
        />
        <InfoCard
          icon={MapPin}
          label="Region"
          value={data.regionName}
          detail={data.region}
        />
        <InfoCard
          icon={Hash}
          label="Postal Code"
          value={data.zip || "N/A"}
          detail="ZIP / Postal code"
        />
      </div>
    </div>
  );
}
