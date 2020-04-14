<template>
    <div class="right-side">
        <textarea
            :disabled="curEditIndex===0"
            v-model="hostVal"
            class="file-content-textarea"
            autofocus="true"
            @blur="saveFileHandler()"
            @keydown="change"
        ></textarea>
    </div>
</template>

<script>
import { readFile, wtFile } from '@script/file.js';
export default {
    props: ['localFiles','curEditIndex'],
    data () {
        return {
            hostVal: ''
        }
    },
    watch: {
        curEditIndex (nIndex) {
            let hostVal = '';
            if (this.curEditIndex===0) {
                hostVal = readFile('local','System');
            } else {
                let fileName = this.localFiles[this.curEditIndex-1].title;
                hostVal = readFile('local',fileName);
            }
            this.hostVal = hostVal;
        }
    },
    computed: {
    },
    methods: {
        change (e) {
            if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
                this.saveFileHandler();
            }
        },
        // 编辑区操作
        saveFileHandler () {
            let path;
            if (this.curEditIndex===0) {
                path = 'System';
            } else {
                let fileName = this.localFiles[this.curEditIndex-1].title;
                path = fileName;
            }
            wtFile(path,this.hostVal);
        }
    }
}
</script>

<style lang='scss'>

.right-side {
    flex-grow: 1;
    background: #ffffff;
    // overflow: hidden;

    .file-content-textarea {
        width: 100%;
        height: 94%;
        box-sizing: border-box;
        outline: none;
        padding: 15px 20px;
        font-size: 14px;
        font-weight: 500;
        color: rgb(68, 67, 67);
        background: #ffffff;
        border: none;
        outline:none;
        resize:none;
    }
}
</style>