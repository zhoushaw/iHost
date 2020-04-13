<template>
    <div id="wrapper">
        <div class="left-side">
            <div class="tool-bar">
                <el-tooltip class="tooltip" content="新建" placement="bottom">
                    <i class="el-icon-document-add" @click="showEdit()"></i>
                </el-tooltip>
                <el-tooltip content="删除" placement="bottom">
                    <i class="el-icon-delete" @click="deleteFile"></i>
                </el-tooltip>
                <el-tooltip content="新建" placement="bottom">
                    <i class="el-icon-remove-outline"></i>
                </el-tooltip>
                <el-tooltip content="新建" placement="bottom">
                    <i class="el-icon-circle-check"></i>
                </el-tooltip>
            </div>
            <div class="host-list">
                <div class="item" :class="{'active':curEditIndex===0}"  @click="selectFile(0)"><i class="el-icon-s-tools"></i> System Hosts</div>
                <div class="item" v-for="(file,index) in localFiles" :class="{'active':curEditIndex===index+1}" :key="index" @click="selectFile(index+1)">
                    <i class="el-icon-document"></i> 
                    <span @dblclick="editInput(index)">{{file.title}}</span>
                    <i class="el-icon-edit edit" @click="showEdit(true,index)"></i>
                    <el-switch
                        style="margin-left: 20px;"
                        :width="30"
                        inactive-color="#404040"
                        v-model="file.isActive">
                    </el-switch>
                </div>
            </div>
        </div>

        <div class="right-side">
            <textarea
                :disabled="curEditIndex===0"
                v-model="hostVal"
                class="file-content-textarea"
                @blur="saveFileHandler()"
                @keydown="change"
            ></textarea>
        </div>

        <EditHostInfo 
            v-show="editInfo.show"
            :title="editInfo.title"
            :editInfo="editInfo"
            @confirm="confirmDialog"
            @toggle-status="()=>{this.editInfo.show = false}"
        />
    </div>
</template>

<script>
import { readFile, redhost, writeHost, getLocalFileList , dlFile } from '@script/file.js';
import EditHostInfo from './components/editHostInfo.vue';
export default {
    name: 'home',
    components: {
        EditHostInfo
    },
    data () {
        return {
            localFiles: [], // {title: 'My Host',isEdit: false,isActive: false}
            hostVal: '',
            curType: '',
            curEditIndex: 0,
            editInfo: {
                show: false,
                isEdit: false,
                index: null,
                title: ''
            }
        }
    },
    created (){
        this.refreshList();
        this.selectFile(0);
    },
    methods: {
        refreshList () {
            this.localFiles = getLocalFileList();
        },
        change (e) {
            if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
                this.saveFileHandler();
            }
        },
        selectFile (index) {
            if (index===0) {
                this.hostVal = readFile('local','System');
            } else {
                let fileName = this.localFiles[index-1].title;
                this.hostVal = readFile('local',fileName);
            }
            this.curEditIndex = index;
        },
        saveFileHandler () {
            writeHost(this.hostVal);
        },
        showEdit (flag,index) {
            this.editInfo = {
                show: true,
                isEdit: flag,
                title:  flag? this.localFiles[index].title : '',
                index: index
            };
        },
        confirmDialog (editInfo) {
            if (typeof editInfo.index === 'number') {
                this.localFiles[editInfo.index].title = editInfo.title;
            }

            if (!editInfo.isEdit) this.refreshList();

            this.editInfo = {
                show: false,
                isEdit: false,
                title: '',
                index: null
            };
        },
        deleteFile(){
            let fileName = this.localFiles[this.curEditIndex-1].title;
            dlFile(fileName)
            this.refreshList();
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
    .left-side {
        flex-basis: 224px;
        height: 100%;
        background: #212121;
        .tool-bar {
            display: flex;
            justify-content: space-around;
            align-items: center;
            height: 50px;
            background: #0c0c0c;
            color: #9e9e9e;
            font-size: 20px;
            i {
                padding: 8px;
            }
            i:hover{
                color: rgb(151, 149, 149);
                background: rgb(66, 66, 66);
                border-radius: 50%;
                cursor: pointer;
            }
        }
        .host-list {
            color: #ccc;
            font-size: 12px;
            .item {
                display: flex;
                align-items: center;
                height: 30px;
                padding: 10px 20px;
                cursor: pointer;
                user-select:none;
                &:hover,&.active{
                    background: #2b2a2a;
                }
                

                .edit {
                    margin: 0;
                    visibility: hidden;
                }
                &:hover{
                    .edit{
                        visibility: visible;
                    }
                }


                i {
                    margin-right: 10px;
                }
                span {
                    display: inline-block;
                    width: 100px;
                    height: 20px;
                    line-height: 20px;
                }
                input {
                    width: 100px;
                    box-sizing: border-box;
                    height: 20px;
                    border-radius: 5px;
                    background: transparent;
                    border: 1px solid #aaa;
                    outline: none;
                    color: #ccc;
                }
            }
        }
    }



    .right-side {
        flex-grow: 1;
        background: #404040;
        // overflow: hidden;
    }

}



.file-content-textarea {
    width: 100%;
    height: 94%;
    box-sizing: border-box;
    outline: none;
    padding: 15px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #ccc;
    background: #404040;
    border: none;
    outline:none;
    resize:none;
}

</style>