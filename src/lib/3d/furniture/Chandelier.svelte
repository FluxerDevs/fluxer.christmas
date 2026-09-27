<script lang="ts">
	import { T } from '@threlte/core';
	import { FakeGlowMaterial } from '@threlte/extras';
	import { LAYOUT } from '$lib/game/world';

	const { position } = LAYOUT.chandelier;
	const BRASS = '#b08d57';
	/** Ceiling beams are 0.22 m deep, so the chain starts below them. */
	const HANG = 0.22;
	const DROP = 0.75;
	const RING_R = 0.42;
	const ARMS = 6;
	const arms = Array.from({ length: ARMS }, (_, i) => (i / ARMS) * Math.PI * 2);
</script>

<T.Group {position}>
	<!-- Chain / rod -->
	<T.Mesh position.y={-HANG - DROP / 2}>
		<T.CylinderGeometry args={[0.012, 0.012, DROP, 6]} />
		<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.35} />
	</T.Mesh>
	<T.Mesh position.y={-HANG - 0.02}>
		<T.CylinderGeometry args={[0.08, 0.05, 0.04, 16]} />
		<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.35} />
	</T.Mesh>

	<T.Group position.y={-HANG - DROP}>
		<!-- Central column -->
		<T.Mesh position.y={-0.1}>
			<T.SphereGeometry args={[0.1, 20, 16]} />
			<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
		</T.Mesh>
		<T.Mesh position.y={-0.24}>
			<T.ConeGeometry args={[0.06, 0.16, 16]} />
			<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
		</T.Mesh>

		<!-- Ring -->
		<T.Mesh position.y={-0.12} rotation.x={Math.PI / 2}>
			<T.TorusGeometry args={[RING_R, 0.018, 8, 48]} />
			<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
		</T.Mesh>

		<!-- Arms with candle bulbs -->
		{#each arms as angle, i (i)}
			{@const x = Math.cos(angle) * RING_R}
			{@const z = Math.sin(angle) * RING_R}
			<T.Mesh position={[x / 2, -0.12, z / 2]} rotation={[0, -angle, Math.PI / 2]}>
				<T.CylinderGeometry args={[0.012, 0.012, RING_R, 6]} />
				<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
			</T.Mesh>
			<T.Group position={[x, -0.12, z]}>
				<T.Mesh position.y={0.02}>
					<T.CylinderGeometry args={[0.045, 0.03, 0.04, 12]} />
					<T.MeshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
				</T.Mesh>
				<T.Mesh position.y={0.1}>
					<T.CylinderGeometry args={[0.02, 0.02, 0.12, 10]} />
					<T.MeshStandardMaterial color="#f4efe4" roughness={0.6} />
				</T.Mesh>
				<T.Mesh position.y={0.19} scale={[1, 1.5, 1]}>
					<T.SphereGeometry args={[0.028, 12, 12]} />
					<T.MeshBasicMaterial color="#ffe0a0" toneMapped={false} />
				</T.Mesh>
				<T.Mesh position.y={0.19}>
					<T.SphereGeometry args={[0.16, 12, 12]} />
					<FakeGlowMaterial
						glowColor="#ffc070"
						falloff={0.3}
						glowInternalRadius={5}
						glowSharpness={0.5}
					/>
				</T.Mesh>
			</T.Group>
		{/each}

		<!-- Warm overhead fill -->
		<T.PointLight
			position.y={-0.3}
			color="#ffbf7a"
			intensity={5}
			distance={0}
			decay={1.5}
			castShadow
			shadow.mapSize.width={1024}
			shadow.mapSize.height={1024}
			shadow.bias={-0.002}
			shadow.normalBias={0.03}
			shadow.camera.near={0.1}
			shadow.camera.far={12}
		/>
	</T.Group>
</T.Group>
