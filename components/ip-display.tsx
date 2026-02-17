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
  Cable,
  Smartphone,
  Shield,
  Server,
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
  asname: string;
  reverse: string;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
  connectionType: string;
}

interface IpDisplayProps {
  targetIp?: string;
}

export function IpDisplay({ targetIp }: IpDisplayProps) {
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);

    const url = targetIp ? `/api/ip?ip=${encodeURIComponent(targetIp)}` : "/api/ip";

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [targetIp]);

  const handleCopy = async () => {
    if (!data?.ip) return;
    await navigator.clipboard.writeText(data.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-32 animate-pulse rounded-md bg-secondary" />
          <div className="h-12 w-72 animate-pulse rounded-lg bg-secondary" />
        </div>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-secondary"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-center text-muted-foreground">
        IP-Informationen konnten nicht abgerufen werden.
      </p>
    );
  }

  const connectionIcon = data.mobile
    ? Smartphone
    : data.proxy
      ? Shield
      : data.hosting
        ? Server
        : Cable;

  const flags: string[] = [];
  if (data.mobile) flags.push("Mobilfunk");
  if (data.proxy) flags.push("Proxy/VPN");
  if (data.hosting) flags.push("Hosting");

  return (
    <div className="flex w-full flex-col items-center gap-10">
      {/* IP Address Hero */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {targetIp ? "Abgefragte IP-Adresse" : "Deine IP-Adresse"}
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl font-mono">
            {data.ip}
          </h1>
          <button
            onClick={handleCopy}
            className="rounded-lg border border-border bg-secondary p-2.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
            aria-label="IP-Adresse kopieren"
          >
            {copied ? (
              <Check className="h-5 w-5 text-primary" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
        {data.city !== "Unbekannt" && (
          <p className="text-base text-muted-foreground">
            {data.city}, {data.regionName}, {data.country}
          </p>
        )}
      </div>

      {/* Connection Type Banner */}
      <div className="flex w-full max-w-4xl flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <connectionIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold text-foreground">
            {data.connectionType}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Erkannter Verbindungstyp</p>
        {flags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            {flags.map((flag) => (
              <span
                key={flag}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          icon={MapPin}
          label="Standort"
          value={
            data.city !== "Unbekannt"
              ? `${data.city}, ${data.regionName}`
              : "Unbekannt"
          }
          detail={data.country}
        />
        <InfoCard
          icon={Globe}
          label="Land"
          value={data.country}
          detail={data.countryCode}
        />
        <InfoCard
          icon={Clock}
          label="Zeitzone"
          value={data.timezone}
          detail="IANA Zeitzone"
        />
        <InfoCard
          icon={Wifi}
          label="Anbieter (ISP)"
          value={data.isp}
          detail="Internetdienstanbieter"
        />
        <InfoCard
          icon={Building2}
          label="Organisation"
          value={data.org}
          detail="Netzwerk-Organisation"
        />
        <InfoCard
          icon={Hash}
          label="AS-Nummer"
          value={data.as}
          detail={data.asname || "Autonomes System"}
        />
        <InfoCard
          icon={Map}
          label="Koordinaten"
          value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`}
          detail="Breitengrad, Laengengrad"
        />
        <InfoCard
          icon={MapPin}
          label="Region"
          value={data.regionName}
          detail={data.region}
        />
        <InfoCard
          icon={Hash}
          label="Postleitzahl"
          value={data.zip || "N/V"}
          detail="PLZ"
        />
      </div>
    </div>
  );
}
