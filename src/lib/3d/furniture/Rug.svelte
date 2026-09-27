<script lang="ts">
	import { T } from '@threlte/core';
	import { LAYOUT, SIZES } from '$lib/game/world';
	import { rugTexture } from '../textures';

	const { position, rotationY } = LAYOUT.rug;
	const [width, depth] = SIZES.rug;
	const texture = rugTexture();
</script>

<T.Group {position} rotation.y={rotationY}>
	<T.Mesh position.y={0.016} rotation.x={-Math.PI / 2} receiveShadow>
		<T.PlaneGeometry args={[width, depth]} />
		<T.MeshStandardMaterial map={texture} roughness={1} />
	</T.Mesh>
	<!-- Slight thickness at the edges -->
	<T.Mesh position.y={0.006} receiveShadow>
		<T.BoxGeometry args={[width, 0.012, depth]} />
		<T.MeshStandardMaterial color="#4a1a12" roughness={1} />
	</T.Mesh>
</T.Group>
