<template>
	<div class="toast" :class="{ show: visible }" role="status">{{ message }}</div>
</template>

<script>
	export default {
		name: 'AppToast',
		props: {
			message: {
				type: String,
				default: ''
			},
			visible: {
				type: Boolean,
				default: false
			}
		}
	}
</script>