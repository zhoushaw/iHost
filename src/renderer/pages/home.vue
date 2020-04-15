<template>
    <div id="wrapper">
        
        <SideBar 
            :localFiles="localFiles" 
            :curEditIndex="curEditIndex"
            @refresh-json="refreshHostJson"
            @set-files="setLocalFiels" 
            @set-edit-index="setEditIndex"/>

        <TextArea 
            :localFiles="localFiles" 
            :curEditIndex="curEditIndex"
            @refresh-json="refreshHostJson"/>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron')
import { readFile } from '@script/file.js';
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
            curEditIndex: 0,
            hostJson: {},
        }
    },
    methods: {
        setLocalFiels (localFiles) {
            this.localFiles = localFiles;
        },
        setEditIndex (index) {
            this.curEditIndex = index;
        },
        refreshHostJson () {
            let hostC = '';
            let hostJson = {};
            this.localFiles.forEach((item,key) => {
                if (item.isActive) {
                    hostC += readFile('local', item.title);
                }
            });
            
            hostC.split('\n').forEach((hosts=>{
                let hostArr = hosts.split(' ');
                let ip = hostArr[0];
                let host = hostArr.slice(1)
                host.forEach((ht)=>{
                    hostJson[ht] = ip;
                })
            }))
            this.hostJson = hostJson;
            
            // 通知主进程hostJson更改
            ipcRenderer.send('change-host-json', hostJson)
            return hostJson;
        }
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