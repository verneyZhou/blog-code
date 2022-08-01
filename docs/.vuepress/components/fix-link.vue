<template>
<a class="fix-link" :href="`${preffix}${href}`">{{label || '目录'}}</a>
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
        // preffix: '/blog',
        preffix: '',
    };
    },
    computed: {
    },
    watch: {},
    //方法集合
    methods: {

    },
    created() {
    },
    mounted() {

    },
}
</script>
<style scoped>
.fix-link {
    position: fixed;
    display: inline-block !important;
    /* display: none; */
    white-space: wrap;
    min-width: 32px;
    z-index: 999;
    padding: 2px;
    top: 4rem;
    right: 4px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid rgb(0,170,170);
    background: #e2f5ec;
    text-align: center;
}
</style>