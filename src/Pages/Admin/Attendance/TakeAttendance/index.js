import { Alert, Box, Button, FormControlLabel, Radio, RadioGroup, Snackbar, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import clsx from 'clsx';
import { RadioButtonChecked, RadioButtonUnchecked } from '@mui/icons-material';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import adminAttendanceAPI from 'src/api/adminAttendanceAPI';

function TakeAttendance() {
    const [userList, setUserList] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [customAlert, setCustomAlert] = useState({ severity: '', message: '' });
    const location = useLocation();
    const history = useNavigate();

    const _trainingScheduleId = location.state?.id;
    const _nowDate = location.state?.date;

    let attendance = userList.reduce((attendaceCount, user) => {
        return user.status ? attendaceCount + 1 : attendaceCount;
    }, 0);

    const getAttendanceByStudentId = async () => {
        try {
            const response = await adminAttendanceAPI.getAttendanceByStudentId(_trainingScheduleId);
            setUserList(response.data);
            console.log('get from database', response.data);
        } catch (error) {
            console.log('Không thể lấy dữ liệu người dùng tham gia điểm danh. Error: ', error);
        }
    };

    useEffect(() => {
        getAttendanceByStudentId();
    }, []);

    let snackBarStatus;

    const dynamicAlert = (status, message) => {
        console.log('status of dynamicAlert', status);
        if (status) {
            setCustomAlert({ severity: 'success', message: message });
        } else {
            setCustomAlert({ severity: 'error', message: message });
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackBar(false);
    };

    const columns = [
        { field: 'id', headerName: 'Số thứ tự', flex: 0.5 },
        { field: 'name', headerName: 'Tên', flex: 0.8 },
        { field: 'studentId', headerName: 'Mã sinh viên', width: 150, flex: 0.6 },
        {
            field: 'status',
            headerName: 'Trạng thái',
            flex: 0.5,
            cellClassName: (params) => {
                if (params.value == null) {
                    return '';
                }

                return clsx('status-rows', {
                    active: params.value === 'Có mặt',
                    deactive: params.value === 'Vắng mặt',
                });
            },
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Có mặt - Vắng mặt',
            width: 100,
            flex: 0.5,
            cellClassName: 'actions',
            getActions: (params) => {
                if (params.row.status == 'Có mặt') {
                    return [
                        <GridActionsCellItem
                            icon={<RadioButtonChecked />}
                            label="Có mặt"
                            onClick={() => toggleStatus(params.row.studentId)}
                            color="primary"
                            aria-details="Có mặt"
                        />,
                        <GridActionsCellItem
                            icon={<RadioButtonUnchecked />}
                            label="Vắng mặt"
                            onClick={() => toggleStatus(params.row.studentId)}
                        />,
                    ];
                }
                return [
                    <GridActionsCellItem
                        icon={<RadioButtonUnchecked />}
                        label="Có mặt"
                        onClick={() => toggleStatus(params.row.studentId)}
                    />,
                    <GridActionsCellItem
                        icon={<RadioButtonChecked />}
                        label="Vắng mặt"
                        onClick={() => toggleStatus(params.row.studentId)}
                        color="primary"
                    />,
                ];
            },
        },
    ];

    const rowsUser = userList.map((item, index) => {
        const container = {};
        container['id'] = index + 1;
        container['name'] = item.name;
        container['studentId'] = item.studentId;
        container['status'] = item.status ? 'Có mặt' : 'Vắng mặt';
        return container;
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({});

    const onSubmit = () => {
        history({ pathname: '/admin/attendance' }, { state: { id: _trainingScheduleId, date: _nowDate } });
    };

    const takeAttend = async (id) => {
        try {
            await adminAttendanceAPI.takeAttendance(id);
        } catch (error) {
            console.log('Không thể điểm danh, error: ', error);
        }
    };

    const toggleStatus = (id) => {
        takeAttend(id);
        const newUserList = userList.map((user) => {
            return user.studentId === id ? { ...user, status: !user.status } : user;
        });
        console.log(newUserList);
        setUserList(newUserList);
    };

    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{ justifyContent: 'space-between' }}>
                <Box
                    sx={{
                        p: 0.5,
                        pb: 0,
                    }}
                >
                    <GridToolbarQuickFilter />
                </Box>
            </GridToolbarContainer>
        );
    }
    return (
        <Fragment>
            <Snackbar
                open={openSnackBar}
                autoHideDuration={5000}
                onClose={handleCloseSnackBar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={handleCloseSnackBar}
                    variant="filled"
                    severity={customAlert.severity || 'success'}
                    sx={{ width: '100%' }}
                >
                    {customAlert.message}
                </Alert>
            </Snackbar>
            <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 500, marginBottom: 2 }}>
                Trạng thái điểm danh ngày: {_nowDate.toLocaleDateString('vi-VN')}
                <Typography variant="h6">
                    Số người tham gia hôm nay {attendance}/{userList.length}
                </Typography>
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Box
                    sx={{
                        height: '70vh',
                        width: '100%',
                        '& .status-rows': {
                            justifyContent: 'center !important',
                            minHeight: '0px !important',
                            maxHeight: '35px !important',
                            borderRadius: '100px',
                            position: 'relative',
                            top: '9px',
                        },
                        '& .status-rows.active': {
                            backgroundColor: '#56f000',
                            color: '#fff',
                            fontWeight: '600',
                            textAlign: 'center',
                        },
                        '& .status-rows.deactive': {
                            backgroundColor: '#ff3838',
                            color: '#fff',
                            fontWeight: '600',
                        },
                    }}
                >
                    <DataGrid
                        loading={!userList.length}
                        disableSelectionOnClick={true}
                        rows={rowsUser}
                        columns={columns}
                        pageSize={pageSize}
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[10, 20, 30]}
                        components={{
                            Toolbar: CustomToolbar,
                        }}
                    />
                </Box>
                <Button type="submit">Đồng ý</Button>
            </Box>
        </Fragment>
    );
}

export default TakeAttendance;
