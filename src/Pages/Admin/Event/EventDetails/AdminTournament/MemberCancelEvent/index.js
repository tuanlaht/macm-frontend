import { Box, Button, FormControl, Grid, MenuItem, Select, Typography } from '@mui/material';
import React, { Fragment, useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import eventApi from 'src/api/eventApi';
import MemberList from '../MemberList';

function MembersCancelEvent() {
    let { id } = useParams();
    let navigate = useNavigate();
    const [type, setType] = useState('All');
    const [userList, setUserList] = useState([]);

    const handleChangeType = (event) => {
        setType(event.target.value);
    };

    const fetchUserCancelEvent = async (params) => {
        try {
            const response = await eventApi.getAllMemberCancel(params);
            console.log(response);
            setUserList(response.data);
            if (response.data.length === 0) {
                console.log('khong co data');
            }
        } catch (error) {
            console.log('Failed to fetch user list: ', error);
        }
    };

    useEffect(() => {
        fetchUserCancelEvent(id);
    }, [id]);

    return (
        <Fragment>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" gutterBottom component="div" sx={{ fontWeight: 500, marginBottom: 2 }}>
                    Danh sách thành viên hủy tham gia sự kiện
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}></Box>

            <MemberList data={userList} />
        </Fragment>
    );
}

export default MembersCancelEvent;
