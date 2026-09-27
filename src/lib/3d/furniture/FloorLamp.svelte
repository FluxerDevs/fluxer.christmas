<script lang="ts">
	import { T } from '@threlte/core';
	import { FakeGlowMaterial } from '@threlte/extras';
	import { DoubleSide } from 'three';
	import { LAYOUT } from '$lib/game/world';

	const { position, rotationY } = LAYOUT.floorLamp;
	const BRASS = '#9a7a3c';
	const SHADE_Y = 1.55;
</script>

<T.Group {position} rotation.y={rotationY}>
	<!-- Base -->
	<T.Mesh position.y={0.025} castShadow receiveShadow>
		<T.CylinderGeometry args={[0.16, 0.2, 0.05, 24]} />
		<T.MeshStandardMaterial color={BRASS} metalness={0.7} roughness={0.35} />
	</T.Mesh>
	<!-- Pole -->
	<T.Mesh position.y={0.8} castShadow>
		<T.CylinderGeometry args={[0.015, 0.02, 1.5, 12]} />
		<T.MeshStandardMaterial color={BRASS} metalness={0.7} roughness={0.35} />
	</T.Mesh>
	<T.Mesh position.y={0.9}>
		<T.SphereGeometry args={[0.03, 12, 12]} />
		<T.MeshStandardMaterial color={BRASS} metalness={0.7} roughness={0.35} />
	</T.Mesh>

	<!-- Shade: warm fabric that glows from the bulb inside -->
	<T.Mesh position.y={SHADE_Y}>
		<T.CylinderGeometry args={[0.17, 0.3, 0.34, 32, 1, true]} />
		<T.MeshStandardMaterial
			color="#e8c89a"
			emissive="#ffb35c"
			emissiveIntensity={1.4}
			side={DoubleSide}
			roughness={1}
		/>
	</T.Mesh>
	<T.Mesh position.y={SHADE_Y - 0.08}>
		<T.SphereGeometry args={[0.05, 12, 12]} />
		<T.MeshBasicMaterial color="#fff1c9" toneMapped={false} />
	</T.Mesh>
	<T.Mesh position.y={SHADE_Y - 0.05}>
		<T.SphereGeometry args={[0.55, 16, 16]} />
		<FakeGlowMaterial
			glowColor="#ffb35c"
			falloff={0.25}
			glowInternalRadius={5}
			glowSharpness={0.4}
		/>
	</T.Mesh>

	<!-- Light spilling out below and above the shade -->
	<T.PointLight
		position.y={SHADE_Y - 0.1}
		color="#ffb870"
		intensity={3.2}
		distance={8}
		decay={1.8}
	/>
</T.Group>
