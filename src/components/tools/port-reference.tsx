"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const PORTS: [number, string, string][] = [
  [20, "FTP Data", "TCP"], [21, "FTP Control", "TCP"], [22, "SSH/SFTP", "TCP"],
  [23, "Telnet", "TCP"], [25, "SMTP", "TCP"], [53, "DNS", "TCP/UDP"],
  [67, "DHCP Server", "UDP"], [68, "DHCP Client", "UDP"], [69, "TFTP", "UDP"],
  [80, "HTTP", "TCP"], [110, "POP3", "TCP"], [119, "NNTP", "TCP"],
  [123, "NTP", "UDP"], [135, "RPC", "TCP"], [137, "NetBIOS", "UDP"],
  [139, "NetBIOS Session", "TCP"], [143, "IMAP", "TCP"], [161, "SNMP", "UDP"],
  [162, "SNMP Trap", "UDP"], [179, "BGP", "TCP"], [194, "IRC", "TCP"],
  [389, "LDAP", "TCP"], [443, "HTTPS", "TCP"], [445, "SMB", "TCP"],
  [465, "SMTPS", "TCP"], [514, "Syslog", "UDP"], [515, "LPD", "TCP"],
  [587, "SMTP Submission", "TCP"], [636, "LDAPS", "TCP"], [993, "IMAPS", "TCP"],
  [995, "POP3S", "TCP"], [1080, "SOCKS", "TCP"], [1433, "MS SQL", "TCP"],
  [1434, "MS SQL Monitor", "UDP"], [1521, "Oracle DB", "TCP"], [1723, "PPTP", "TCP"],
  [2049, "NFS", "TCP/UDP"], [3306, "MySQL", "TCP"], [3389, "RDP", "TCP"],
  [5432, "PostgreSQL", "TCP"], [5900, "VNC", "TCP"], [5984, "CouchDB", "TCP"],
  [6379, "Redis", "TCP"], [6443, "Kubernetes API", "TCP"], [8080, "HTTP Proxy", "TCP"],
  [8443, "HTTPS Alt", "TCP"], [8888, "HTTP Alt", "TCP"], [9090, "Prometheus", "TCP"],
  [9200, "Elasticsearch", "TCP"], [11211, "Memcached", "TCP"], [27017, "MongoDB", "TCP"],
  [27018, "MongoDB Shard", "TCP"], [5672, "RabbitMQ", "TCP"], [15672, "RabbitMQ Mgmt", "TCP"],
  [9092, "Kafka", "TCP"], [2181, "ZooKeeper", "TCP"],
];

export default function PortReference() {
  const t = useTranslations("tools.port-reference");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "TCP" | "UDP">("all");

  const filtered = useMemo(() => {
    return PORTS.filter(([port, name, proto]) => {
      if (filter !== "all" && !proto.includes(filter)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return String(port).includes(q) || name.toLowerCase().includes(q) || proto.toLowerCase().includes(q);
    });
  }, [search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("ui.searchPlaceholder")} className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm" />
        <select value={filter} onChange={e => setFilter(e.target.value as "all" | "TCP" | "UDP")} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm">
          <option value="all">{t("ui.all")}</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 dark:border-zinc-600">
              <th className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">{t("ui.port")}</th>
              <th className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">{t("ui.service")}</th>
              <th className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">{t("ui.protocol")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(([port, name, proto]) => (
              <tr key={port} className="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="py-2 px-3 font-mono text-blue-600 dark:text-blue-400">{port}</td>
                <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{name}</td>
                <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${proto.includes("TCP") ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"}`}>{proto}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">{t("ui.totalPorts", { count: filtered.length })}</p>
    </div>
  );
}
