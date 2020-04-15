<template>
    <div class="right-side">
        <textarea
            v-model="hostVal"
            class="file-content-textarea"
            autofocus="true"
            @blur="saveFileHandler()"
            @keydown="change"
        ></textarea>
    </div>
</template>

<script>
import { readFile, wtFile, writeHost, redhost } from '@script/file.js';
import { GetSudoPassword } from '@script/utils.js';
export default {
    props: ['localFiles','curEditIndex'],
    data () {
        return {
            hostVal: ''
        }
    },
    watch: {
        curEditIndex (nIndex) {
            this.initHostVal();
        }
    },
    created() {
        this.initHostVal();
    },
    methods: {
        initHostVal () {
            let hostVal = '';
            if (this.curEditIndex===0) {
                hostVal = redhost();
            } else {
                let fileName = this.localFiles[this.curEditIndex-1].title;
                hostVal = readFile('local',fileName);
            }
            this.hostVal = hostVal;
        },
        change (e) {
            if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
                this.saveFileHandler();
            }
        },
        // 编辑区操作
        saveFileHandler () {
            let hostVal = this.hostVal;
            if (this.curEditIndex===0) {
                GetSudoPassword().then(()=>{
                    writeHost(hostVal);
                });
            } else {
                let fileName = this.localFiles[this.curEditIndex-1].title;
                wtFile(fileName,hostVal); 
            }
            this.$emit('refresh-json');
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