<template>
    <div class="edit-info">
        <div class="info-dialog">
            <div class="header">
                <span>{{editInfo.isEdit?'Edit Hosts': 'Add new Hosts'}}</span>
                <i class="el-icon-circle-close"  @click="closeDialog"></i>
            </div>
            <div class="body">
                <ul>
                    <li class="active"><i class="el-icon-document"></i> Local</li>
                    <li><i class="el-icon-ship"> </i>Remote</li>
                </ul>
                <div class="list">
                    <span class="type">Hosts title</span> <input :value="title" ref="oInput" autofocus="true"/>
                </div>
            </div>
            <div class="bottom">
                <span @click="closeDialog">Cancle</span>
                <span class="ok" @click="confirm">Ok</span>
            </div>
        </div>

    </div>
</template>

<script>
import { ctFile , reNameFile} from '@script/file.js';
import { Message } from 'element-ui';

export default {
    props: ['editInfo','title','localFiles'],
    data () {
        return {
            value: ''
        }
    },
    methods: {
        closeDialog() {
            this.$emit('toggle-status');
        },
        confirm() {
            let title = this.$refs.oInput.value;
            // 创建文件
            if (!this.editInfo.isEdit) {
                let isExist = this.localFiles.some((item)=>{
                    return item.title === title;
                });
                if (isExist){
                    Message({
                        message: '已存在同名host'
                    });
                    return;
                }
                ctFile(title);
                Message({
                    message: '创建成功',
                    type: 'success'
                });
            } else {
                reNameFile(title,this.title);
            }
            
            this.$emit('confirm',{
                title: title,
                index: this.editInfo.index,
                isEdit: this.editInfo.isEdit
            });
        }
    }

}
</script>

<style lang="scss">
ul,li{
    list-style: none;
    padding: 0;
    margin: 0;
}
.edit-info {
    position: fixed;
    height: 100%;
    width: 100%;
    background: rgba(0,0,0,0.3);
    .info-dialog {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        width: 400px;
        height: 250px;
        background: #fff;
        border-radius: 2px;
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 50px;
            padding: 0 20px;
            color: #262626;
            font-size: 15px;
            border-bottom: 1px solid #e8e8e8;
            i {
                font-size: 22px;
                cursor: pointer;
            }
        }
        .body {
            padding: 0 20px;
            ul {
                display: flex;
                margin-top: 20px;
                border-radius: 3px;
                li{
                    display: inline-block;
                    width: 100px;
                    height: 30px;
                    line-height: 30px;
                    padding-left: 5px;
                    border: 1px solid #d9d9d9;
                    margin-right: -1px;
                    font-size: 15px;
                    cursor: pointer;
                    &.active {
                        color: #1890ff;
                        border-color: #1890ff;
                        z-index: 1;
                    }
                }
            }
            .list {
                display: flex;
                align-items: center;
                margin-top: 20px;
                .type {
                    display: inline-block;
                    width: 104px;
                }
                input {
                    height: 25px;
                    width: 180px;
                    border: 1px solid #aaa;
                    color: #ccc;
                    border-radius: 2px;
                    padding-left: 5px;
                    outline: #1890ff;
                    color: #686666;
                }
            }
        }
        .bottom {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 50px;
            border-top: 1px solid #e8e8e8;
            span {
                display: inline-block;
                width: 50px;
                height: 30px;
                text-align: center;
                line-height: 30px;
                color: #262626;
                font-size: 14px;
                border: 1px solid #e8e8e8;
                margin-right: 10px;
                cursor: pointer;
                border-radius: 3px;;
            }
            .ok {
                background: #1890ff;
                color: #fff;
                border: none;
            }
        }
    }
}
</style>