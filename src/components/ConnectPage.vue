<template>
	<!-- 新建连接页（未连接态首屏；.app-shell 无 .app-online 时显示，顶栏保留但全部禁用） -->
	<main class="connect-page">
		<div class="connect-card">
			<!-- 云端 + 链接意象线性图标：黄→琥珀渐变 stroke，与 Logo/空状态风格一致 -->
			<img class="connect-icon" src="@/assets/logo/logo512.png" />
			<h2 class="connect-title">{{ $t('connect.title') }}</h2>
			<p class="connect-desc">{{ $t('connect.desc') }}</p>
			<!-- 未连接页唯一可操作主按钮；connecting 时切换为 spinner + 「连接中…」并禁用 -->
			<button class="btn btn-primary btn-connect-main" :disabled="connecting" @click="$emit('connect')">
				<svg v-show="!connecting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
					stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
				<span v-show="connecting" class="spinner"></span>
				<span>{{ connecting ? $t('connect.connecting') : $t('connect.button') }}</span>
			</button>
		</div>
	</main>
</template>

<script>
export default {
	name: 'ConnectPage',
	props: {
		connecting: { type: Boolean, default: false }
	}
}
</script>
