<template>
<a class="fix-link" :href="href">{{label || '目录'}}</a>
</template>

<script>

export default {
    props: {
        label: '',
        href: '',
    },
    components: {},
    data() {
    return {

    };
    },
    computed: {},
    watch: {},
    //方法集合
    methods: {

    },
    created() {
    console.log('fix link');
    },
    mounted() {

    },
}
</script>
<style scoped>
.fix-link {
    position: fixed;
    display: inline-block;
    white-space: wrap;
    width: 32px;
    z-index: 999;
    padding: 2px;
    top: 4rem;
    right: 2px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #3eaf7c;
    background: #e2f5ec;
    text-align: center;
}
</style>