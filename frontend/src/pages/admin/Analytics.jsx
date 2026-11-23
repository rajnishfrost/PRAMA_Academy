import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '1 year' },
]

function fmtDate(d) {
  try { return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return d }
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">{value?.toLocaleString?.('en-IN') ?? value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

// Simple horizontal bar list — no chart library.
function BarList({ title, rows, labelKey, max }) {
  const top = max || Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={i}>
              <div className="flex items-center justify-between text-sm mb-0.5">
                <span className="text-gray-700 truncate pr-2">{labelKey(r)}</span>
                <span className="text-gray-500 font-medium shrink-0">{r.count.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(r.count / top) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Visits-per-day column chart (CSS).
function DayChart({ byDay }) {
  const max = Math.max(1, ...byDay.map((d) => d.visits))
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Visits per day</h3>
      {byDay.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <div className="flex items-end gap-0.5 h-40 overflow-x-auto">
          {byDay.map((d) => (
            <div key={d.date} className="flex-1 min-w-[6px] flex flex-col items-center justify-end group relative">
              <div
                className="w-full bg-primary/80 hover:bg-primary rounded-t transition-colors"
                style={{ height: `${(d.visits / max) * 100}%` }}
              />
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded px-1.5 py-1 whitespace-nowrap z-10">
                {d.date}: {d.visits} visits · {d.unique} unique
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Analytics() {
  const [days, setDays] = useState(30)
  const [bots, setBots] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    api.get(`/analytics/summary?days=${days}&bots=${bots ? 1 : 0}`)
      .then((d) => { if (alive) setData(d) })
      .catch((e) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [days, bots])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Analytics</h1>
          <p className="text-sm text-gray-500">Visitor traffic across the public site.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-500">
            <input type="checkbox" checked={bots} onChange={(e) => setBots(e.target.checked)} className="rounded" />
            Include bots
          </label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 text-sm ${days === r.days ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="text-gray-500">Loading analytics…</div>}
      {error && <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {data && !loading && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total visits" value={data.totals.visits} sub={`last ${data.days} days`} />
            <StatCard label="Unique visitors" value={data.totals.uniqueVisitors} />
            <StatCard label="Logged-in visits" value={data.totals.loggedInVisits} />
            <StatCard label="Countries" value={data.totals.countries} />
          </div>

          <DayChart byDay={data.byDay} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BarList
              title="Top countries"
              rows={data.topCountries.map((c) => ({ count: c.count, name: c.name || c._id || 'Unknown' }))}
              labelKey={(r) => r.name}
            />
            <BarList
              title="Top cities"
              rows={data.topCities.map((c) => ({ count: c.count, name: `${c._id.city}${c._id.country ? ', ' + c._id.country : ''}` }))}
              labelKey={(r) => r.name}
            />
            <BarList
              title="Top pages"
              rows={data.topPages.map((p) => ({ count: p.count, name: p._id || '/' }))}
              labelKey={(r) => r.name}
            />
            <BarList
              title="Top referrers"
              rows={data.topReferrers.map((p) => ({ count: p.count, name: p._id }))}
              labelKey={(r) => r.name}
            />
            <BarList
              title="Devices"
              rows={data.byDevice.map((d) => ({ count: d.count, name: d._id || 'Other' }))}
              labelKey={(r) => r.name}
            />
            <BarList
              title="Browsers"
              rows={data.byBrowser.map((d) => ({ count: d.count, name: d._id || 'Other' }))}
              labelKey={(r) => r.name}
            />
          </div>

          {/* Top visitors */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-700 p-5 pb-3">Top visitors (who returns most)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-400 border-y border-gray-100 bg-gray-50">
                    <th className="px-5 py-2 font-medium">Visitor</th>
                    <th className="px-5 py-2 font-medium">Visits</th>
                    <th className="px-5 py-2 font-medium">Location</th>
                    <th className="px-5 py-2 font-medium">ISP</th>
                    <th className="px-5 py-2 font-medium">IP</th>
                    <th className="px-5 py-2 font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.topVisitors.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50">
                      <td className="px-5 py-2.5">
                        {v.student ? (
                          <span className="font-medium text-gray-900">{v.student.name}<span className="text-gray-400 font-normal"> · {v.student.email}</span></span>
                        ) : (
                          <span className="text-gray-400 font-mono text-xs">{(v._id || '').slice(0, 12) || 'anon'}…</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 font-semibold text-gray-900">{v.count}</td>
                      <td className="px-5 py-2.5 text-gray-600">{[v.city, v.country].filter(Boolean).join(', ') || '—'}</td>
                      <td className="px-5 py-2.5 text-gray-500 truncate max-w-[180px]">{v.isp || '—'}</td>
                      <td className="px-5 py-2.5 text-gray-500 font-mono text-xs">{v.ip || '—'}</td>
                      <td className="px-5 py-2.5 text-gray-500">{fmtDate(v.lastSeen)}</td>
                    </tr>
                  ))}
                  {data.topVisitors.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-6 text-center text-gray-400">No visitors yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent visits */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-700 p-5 pb-3">Recent visits</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-400 border-y border-gray-100 bg-gray-50">
                    <th className="px-5 py-2 font-medium">Time</th>
                    <th className="px-5 py-2 font-medium">Page</th>
                    <th className="px-5 py-2 font-medium">Location</th>
                    <th className="px-5 py-2 font-medium">Device</th>
                    <th className="px-5 py-2 font-medium">User / IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recent.map((v) => (
                    <tr key={v._id} className={`hover:bg-gray-50 ${v.isBot ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{fmtDate(v.createdAt)}</td>
                      <td className="px-5 py-2.5 text-gray-700 truncate max-w-[200px]">{v.path}</td>
                      <td className="px-5 py-2.5 text-gray-600">{[v.city, v.country].filter(Boolean).join(', ') || '—'}</td>
                      <td className="px-5 py-2.5 text-gray-500">{[v.device, v.browser].filter(Boolean).join(' · ')}</td>
                      <td className="px-5 py-2.5 text-gray-500">
                        {v.student ? <span className="text-gray-800">{v.student.name}</span> : <span className="font-mono text-xs">{v.ip}</span>}
                        {v.isBot && <span className="ml-1 text-[10px] uppercase text-amber-500">bot</span>}
                      </td>
                    </tr>
                  ))}
                  {data.recent.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400">No visits recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
