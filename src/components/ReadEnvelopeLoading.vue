<template>
	<!-- 读取链上数据中：全屏遮罩 + 倒计时，避免 unlock 卡住时用户无反馈 -->
	<div class="read-envelope-loading" :class="{ open: visible }">
		<div class="read-envelope-card">
			<span class="spinner read-envelope-spinner"></span>
			<div class="read-envelope-title">{{ $t('readEnvelopeLoading.title') }}</div>
			<div class="read-envelope-countdown">{{ $t('readEnvelopeLoading.countdown', { n: seconds }) }}</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ReadEnvelopeLoading',
	props: {
		visible: { type: Boolean, default: false },
		seconds: { type: Number, default: 10 } // 剩余秒数
	}
}
</script>
