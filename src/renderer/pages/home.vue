<template>
    <div id="wrapper">
        
        <SideBar 
            :localFiles="localFiles" 
            :curEditIndex="curEditIndex"
            @set-files="setLocalFiels" 
            @set-edit-index="setEditIndex"/>

        <TextArea 
            :localFiles="localFiles" 
            :curEditIndex="curEditIndex"/>
    </div>
</template>

<script>
import SideBar from './components/sidebar.vue';
import TextArea from './components/textArea.vue';
import { Message, MessageBox } from 'element-ui';


export default {
    name: 'home',
    components: {
        SideBar,
        TextArea
    },
    data () {
        return {
            localFiles: [], // {title: 'My Host',isEdit: false,isActive: false}
            hostVal: '',
            curType: '',
            curEditIndex: 0
        }
    },
    methods: {
        setLocalFiels (localFiles) {
            this.localFiles = localFiles;
        },
        setEditIndex (index) {
            this.curEditIndex = index;
        },


    }
}
</script>

<style lang="scss">

* {
    margin: 0;
}
html,body { 
    height: 100%;
    width: 100%;
}


#wrapper {
    display: flex;
    justify-content: space-between;
    background:
        radial-gradient(
            ellipse at top left,
            rgba(255, 255, 255, 1) 40%,
            rgba(229, 229, 229, .9) 100%
        );
    height: 100vh;
    width: 100vw;




}



</style>