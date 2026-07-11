import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ACCENT = new THREE.Color('#F0853A')
const DIM = new THREE.Color('#6E6E74')

/** Deterministic-enough random graph: a cloud of nodes wired to nearest neighbours. */
function buildGraph(n: number) {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < n; i++) {
    const r = 2.4 * Math.sqrt(Math.random())
    const a = Math.random() * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.82, (Math.random() - 0.5) * 1.8))
  }
  const edges: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const near = pts
      .map((p, j) => ({ j, d: p.distanceTo(pts[i]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
    const k = 2 + (i % 2)
    for (let m = 0; m < k; m++) {
      const j = near[m].j
      if (!edges.some((e) => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i))) {
        edges.push([i, j])
      }
    }
  }
  // ~1/4 of nodes read as "active" / alerting
  const active = new Set<number>()
  while (active.size < Math.round(n / 4)) active.add(Math.floor(Math.random() * n))
  return { pts, edges, active }
}

export function SecurityGraph() {
  const group = useRef<THREE.Group>(null!)
  const nodes = useRef<THREE.InstancedMesh>(null!)
  const packets = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const { pts, edges, active } = useMemo(() => buildGraph(24), [])

  // Edge geometry (line segments).
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      pts[a].toArray(pos, i * 6)
      pts[b].toArray(pos, i * 6 + 3)
    })
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [pts, edges])

  // A handful of "packets" travelling along random edges.
  const travellers = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        e: Math.floor(Math.random() * edges.length),
        t: Math.random(),
        speed: 0.12 + Math.random() * 0.22,
      })),
    [edges],
  )

  // Place nodes once + colour active vs dim.
  useLayoutEffect(() => {
    pts.forEach((p, i) => {
      const s = active.has(i) ? 0.07 : 0.045
      dummy.position.copy(p)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      nodes.current.setMatrixAt(i, dummy.matrix)
      nodes.current.setColorAt(i, active.has(i) ? ACCENT : DIM)
    })
    nodes.current.instanceMatrix.needsUpdate = true
    if (nodes.current.instanceColor) nodes.current.instanceColor.needsUpdate = true

    // Packets are positioned in useFrame; until the first frame runs they sit at the
    // identity matrix (unit spheres stacked at the origin) and read as a white blob.
    dummy.position.set(0, 0, 0)
    dummy.scale.setScalar(0)
    dummy.updateMatrix()
    travellers.forEach((_, i) => packets.current.setMatrixAt(i, dummy.matrix))
    packets.current.instanceMatrix.needsUpdate = true
  }, [pts, active, dummy, travellers])

  useFrame((state, dt) => {
    if (document.hidden) return
    const g = group.current

    // Slow drift + pointer parallax.
    g.rotation.y += dt * 0.05
    const px = state.pointer.x * 0.25
    const py = state.pointer.y * 0.2
    g.rotation.x += (py - g.rotation.x) * 0.04
    g.rotation.z += (-px * 0.3 - g.rotation.z) * 0.04
    g.position.x += (px * 0.4 - g.position.x) * 0.04
    g.position.y += (py * 0.4 - g.position.y) * 0.04

    // March packets along their edges.
    travellers.forEach((tr, i) => {
      tr.t += dt * tr.speed
      if (tr.t > 1) {
        tr.t = 0
        tr.e = Math.floor(Math.random() * edges.length)
      }
      const [a, b] = edges[tr.e]
      dummy.position.lerpVectors(pts[a], pts[b], tr.t)
      dummy.scale.setScalar(0.03)
      dummy.updateMatrix()
      packets.current.setMatrixAt(i, dummy.matrix)
    })
    packets.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.16} />
      </lineSegments>

      <instancedMesh ref={nodes} args={[undefined, undefined, pts.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={packets} args={[undefined, undefined, travellers.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </group>
  )
}
