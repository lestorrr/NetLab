"use client"
import { useState, useMemo } from 'react'
import ToolLayout from '../components/ToolLayout'
import ResultCard from '../components/ResultCard'

function ipToNumber(ip: string): number {
    const parts = ip.split('.').map(Number)
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function numberToIp(num: number): string {
    return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255].join('.')
}

function calculateSubnet(cidr: string) {
    const match = cidr.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
    if (!match) return null

    const ip = match[1]
    const prefix = parseInt(match[2], 10)
    if (prefix < 0 || prefix > 32) return null

    const ipNum = ipToNumber(ip)
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
    const network = (ipNum & mask) >>> 0
    const broadcast = (network | (~mask >>> 0)) >>> 0
    const firstHost = prefix >= 31 ? network : network + 1
    const lastHost = prefix >= 31 ? broadcast : broadcast - 1
    const totalHosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2

    return {
        ip,
        prefix,
        networkAddress: numberToIp(network),
        broadcastAddress: numberToIp(broadcast),
        subnetMask: numberToIp(mask),
        wildcardMask: numberToIp((~mask) >>> 0),
        firstHost: numberToIp(firstHost),
        lastHost: numberToIp(lastHost),
        totalHosts,
        ipClass: ip.split('.')[0] < '128' ? 'A' : ip.split('.')[0] < '192' ? 'B' : ip.split('.')[0] < '224' ? 'C' : 'D/E',
        isPrivate: /^10\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || /^192\.168\./.test(ip),
        binary: {
            ip: ipNum.toString(2).padStart(32, '0').match(/.{8}/g)?.join('.'),
            mask: mask.toString(2).padStart(32, '0').match(/.{8}/g)?.join('.')
        }
    }
}

export default function SubnetCalcPage() {
    const [cidr, setCidr] = useState('192.168.1.0/24')
    const result = useMemo(() => calculateSubnet(cidr), [cidr])

    return (
        <ToolLayout title="Subnet Calculator" description="Calculate network address, broadcast, host range, and subnet mask from CIDR notation.">
            <div className="card max-w-2xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">CIDR Notation</h2>
                <input
                    className="input"
                    value={cidr}
                    onChange={(e) => setCidr(e.target.value)}
                    placeholder="192.168.1.0/24"
                />
                <p className="text-xs text-gray-500 mt-2">Format: IP/prefix (e.g., 10.0.0.0/8, 172.16.0.0/12)</p>
            </div>

            {result ? (
                <div className="space-y-4">
                    <ResultCard
                        status="info"
                        title="Subnet Details"
                        subtitle={`${result.networkAddress}/${result.prefix}`}
                        stats={[
                            { label: 'Network', value: result.networkAddress },
                            { label: 'Broadcast', value: result.broadcastAddress },
                            { label: 'Subnet Mask', value: result.subnetMask },
                            { label: 'Wildcard', value: result.wildcardMask },
                            { label: 'First Host', value: result.firstHost },
                            { label: 'Last Host', value: result.lastHost },
                            { label: 'Total Hosts', value: result.totalHosts.toLocaleString() },
                            { label: 'Class', value: result.ipClass },
                        ]}
                    >
                        <div className="grid gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`badge ${result.isPrivate ? 'badge-warning' : 'badge-info'}`}>
                                    {result.isPrivate ? 'Private' : 'Public'}
                                </span>
                                <span className="text-gray-600">IP Range</span>
                            </div>
                            <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                                <div>IP:   {result.binary.ip}</div>
                                <div>Mask: {result.binary.mask}</div>
                            </div>
                        </div>
                    </ResultCard>
                </div>
            ) : (
                <div className="card max-w-2xl">
                    <p className="text-gray-500">Enter a valid CIDR notation to see results</p>
                </div>
            )}
        </ToolLayout>
    )
}
