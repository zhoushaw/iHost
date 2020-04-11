<template>
    <div id="wrapper">
        <main>
        <div class="left-side">
            <div>
                <div class="category-title">Local</div> 
                <div class="file-item-title" v-for="(file,index) in localFiles" :key="index">   
                    <span @click="selectFile(file.title)">{{ file.title }}</span>
                    <!-- <input
                        v-if="file.isEdit"
                        class="file-item-input"
                        v-model.trim="file.title"
                        @keyup.esc="editFileHandler(index)"
                        @keyup.enter="editFileHandler(index)"
                        @blur="editFileHandler(index)" 
                    /> -->
                    <!-- 
                        @keyup.esc="escFileHandler(index)"
                        @keyup.enter="submitFileHandler(file, index)"
                        @blur="escFileHandler(index)" 
                        v-focus="file.isEdit" -->
                </div>
            </div>
        </div>

        <div class="right-side">
            
            <textarea
                v-model="hostVal"
                class="file-content-textarea"
                @blur="saveFileHandler()"
                @keydown="change"
            ></textarea>
        </div>
        </main>
    </div>
</template>

<script>
import {localFiles,readFile,redhost,writeHost} from '@script/file.js'
export default {
    name: 'home',
    data () {
        return {
            localFiles,
            hostVal: '',
            curType: ''
        }
    },
    created () {
        
    },
    methods: {
        selectFile () {
            var file = readFile('local','origin');
            this.hostVal = file;
            this.curType = 'local';
        },
        change (e) {
            if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
                this.saveFileHandler();
            }
        },
        editFileHandler(index){
            this.localFiles[index].isEdit = !this.localFiles[index].isEdit;
        },
        saveFileHandler() {
            writeHost(this.hostVal);
            restar();
        }
    }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

* {
    margin: 0;
}
body { 
    font-family: 'Source Sans Pro', sans-serif;
}



#wrapper {
    background:
        radial-gradient(
            ellipse at top left,
            rgba(255, 255, 255, 1) 40%,
            rgba(229, 229, 229, .9) 100%
        );
    height: 100vh;
    width: 100vw;
}

main {
    display: flex;
    justify-content: space-between;
    height: 100vh;
    width: 100vw;
}

.category-title {
    font-weight: bold;
    color: #666;
    margin-top: 20px;
}


.file-item-title {
    padding-left: 5px;
    display: inline-block;
    color: #aaa;
    font-weight: bold;
    width: 200px;
    height: 30px;
    line-height: 30px;
    cursor: pointer;
}
.file-item-title:hover{
    color: #fff;
    background: #404040;
}

.file-item-value {
    display: inline-block;
    width: 100px;
}
.file-item-input {
    width: 100px;
    font-size: 14px;
    border: 1px solid #aaa;
    color: #aaa;
    border-radius: 4px;
    outline: none;
    padding: 0 5px;
    background: transparent;
    height: 20px;
    outline-style: none ;
}


.file-content-textarea {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    outline: none;
    padding: 15px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #ccc;
    background: #404040;
    border: none;
}

.left-side {
    flex-basis: 200px;
    height: 100%;
    padding: 0 15px;
    background: #303030;
}

.right-side {
    flex-grow: 1;
    background: #404040;
}

</style>