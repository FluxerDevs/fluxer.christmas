<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Color, FogExp2 } from 'three';

	const { scene, renderer } = useThrelte();

	$effect(() => {
		renderer.toneMappingExposure = 1.15;
	});

	$effect(() => {
		scene.background = new Color('#0d0705');
		scene.fog = new FogExp2('#1a0d08', 0.035);
		return () => {
			scene.background = null;
			scene.fog = null;
		};
	});
</script>

<!-- Very low fill: the warm practical lights (fire, chandelier, lamp, tree) do the real work. -->
<T.HemisphereLight args={['#ffcf9a', '#3a1a0e', 0.5]} />
<T.AmbientLight color="#ffb080" intensity={0.08} />
