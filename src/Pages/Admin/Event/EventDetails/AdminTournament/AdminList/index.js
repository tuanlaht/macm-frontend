import React, { Fragment, useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { DataGrid, GridActionsCellItem, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import {
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';

import RegisterAdmin from './RegisterAdmin';
// import userTournamentAPI from 'src/api/userTournamentAPI';
import eventApi from 'src/api/eventApi';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

function AdminList({ adminList, value, index, active, total, isUpdate, user, Success }) {
    // const [data, setData] = useState(adminList);
    const [pageSize, setPageSize] = useState(10);
    const [open, setOpen] = useState(false);
    const [roleList, setRoleList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    let { id } = useParams();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [openDialog, setOpenDialog] = useState(false);

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const fetchUserInEvent = async (params, index) => {
        try {
            const response = await eventApi.getAllMemberEvent(params, index);
            console.log(response);
            setUserList(response.data);
        } catch (error) {
            console.log('Failed to fetch user list: ', error);
        }
    };

    const fetchRoleInEvent = async (params) => {
        try {
            const response = await eventApi.getAllOrganizingCommitteeRoleByEventId(params);
            console.log(response);
            setRoleList(response.data);
        } catch (error) {
            console.log('Failed to fetch user list: ', error);
        }
    };
    const roles = roleList.map((role) => {
        return { roleId: role.id, roleName: role.name };
    });
    const formatRoles = [{ id: 0, roleId: 1, roleName: 'Thành viên tham gia' }, ...roles];
    // const roles = [
    //     { roleId: 1, roleName: 'Thành viên tham gia' },
    //     { roleId: 2, roleName: 'Thành viên ban truyền thông' },
    //     { roleId: 3, roleName: 'Thành viên ban văn hóa' },
    //     { roleId: 4, roleName: 'Thành viên ban hậu cần' },
    // ];
    useEffect(() => {
        fetchUserInEvent(id, 2);
        fetchRoleInEvent(id);
        // console.log('role', formatRoles);
    }, [index, id, value]);

    const handleRowEditCommit = React.useCallback(
        (params) => {
            const id = params.id;
            const key = params.field;
            const value = params.value;
            console.log(id, key, value, params);
            console.log(roles);

            const newRole = formatRoles && formatRoles.find((role) => role.roleName === value);
            console.log('new role', newRole);
            console.log(userList);
            const newMemberList =
                userList &&
                userList.map((member) =>
                    member.id == id
                        ? { ...member, roleEventDto: { id: newRole.roleId, name: newRole.roleName } }
                        : member,
                );
            setUserList(newMemberList);
            setIsEdit(true);
        },
        [userList],
    );

    const handleUpdate = () => {
        console.log('submit', userList);
        eventApi.updateMemberRole(userList).then((res) => {
            console.log(res);
            console.log(res.data);
            enqueueSnackbar(res.message, { variant: 'success' });
            setIsEdit(false);
            handleCloseDialog();
            // navigate(-1);
            // if (res.message === 'Cập nhật chức vụ cho thành viên trong sự kiện thành công') {

            // }
        });
    };

    // useEffect(() => {
    //     setData(adminList);
    // }, [adminList]);

    // const handleOpenDialog = () => {
    //     setOpen(true);
    // };

    // const getRoleInTournament = async () => {
    //     try {
    //         const response = await eventApi.getAllMemberEvent();
    //         console.log(response);
    //         setRoleInTournament(response.data);
    //     } catch (error) {
    //         console.log('Khong the lay duoc role', error);
    //     }
    // };

    // useEffect(() => {
    //     getRoleInTournament();
    // }, []);

    const columns = [
        { field: 'studentName', headerName: 'Tên', flex: 0.8 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'studentId',
            headerName: 'Mã sinh viên',
            width: 150,
            flex: 0.6,
        },
        { field: 'roleInClub', headerName: 'Vai trò trong CLB', width: 150, flex: 1 },
        {
            field: 'role',
            headerName: `Vai trò trong sự kiện`,
            flex: 1,
            // editable: true,
            // type: 'singleSelect',
            // valueOptions: formatRoles.map((role) => role.roleName),
            // // valueOptions: roleValueOptions,
            // renderCell: (params) => (
            //     <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            //         <span>{params.value}</span>
            //         <Tooltip title="DoubleClick để chỉnh sửa vai trò">
            //             <span>
            //                 <GridActionsCellItem icon={<Edit />} label="Edit" sx={{ ml: 2 }} />
            //             </span>
            //         </Tooltip>
            //     </Box>
            // ),
            // cellClassName: (params) => {
            //     if (params.value == null) {
            //         return '';
            //     }

            //     return clsx('role-edit');
            // },
        },
    ];

    const rowsUser =
        userList &&
        userList.map((item, index) => {
            const container = {};
            container['id'] = item.id;
            container['studentName'] = item.userName;
            container['studentId'] = item.userStudentId;
            container['email'] = item.userMail;
            container['roleInClub'] = item.roleInClub;
            container['role'] = item.eventRoleDto.name;

            // container['registerStatus'] = item.registerStatus;
            // container['paymentStatus'] = item.paymentStatus ? 'Đã đóng' : 'Chưa đóng';
            return container;
        });

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
                <Typography variant="button" color="initial" sx={{ marginLeft: 'auto', marginRight: '1rem' }}>
                    Tổng thành viên Ban tổ chức: {rowsUser.length}
                </Typography>
            </GridToolbarContainer>
        );
    }
    const StyledGridOverlay = styled('div')(({ theme }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        '& .ant-empty-img-1': {
            fill: theme.palette.mode === 'light' ? '#aeb8c2' : '#262626',
        },
        '& .ant-empty-img-2': {
            fill: theme.palette.mode === 'light' ? '#f5f5f7' : '#595959',
        },
        '& .ant-empty-img-3': {
            fill: theme.palette.mode === 'light' ? '#dce0e6' : '#434343',
        },
        '& .ant-empty-img-4': {
            fill: theme.palette.mode === 'light' ? '#fff' : '#1c1c1c',
        },
        '& .ant-empty-img-5': {
            fillOpacity: theme.palette.mode === 'light' ? '0.8' : '0.08',
            fill: theme.palette.mode === 'light' ? '#f5f5f5' : '#fff',
        },
    }));
    function CustomNoRowsOverlay() {
        return (
            <StyledGridOverlay>
                <svg width="120" height="100" viewBox="0 0 184 152" aria-hidden focusable="false">
                    <g fill="none" fillRule="evenodd">
                        <g transform="translate(24 31.67)">
                            <ellipse className="ant-empty-img-5" cx="67.797" cy="106.89" rx="67.797" ry="12.668" />
                            <path
                                className="ant-empty-img-1"
                                d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                            />
                            <path
                                className="ant-empty-img-2"
                                d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                            />
                            <path
                                className="ant-empty-img-3"
                                d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                            />
                        </g>
                        <path
                            className="ant-empty-img-3"
                            d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
                        />
                        <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
                            <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
                            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
                        </g>
                    </g>
                </svg>
                <Box sx={{ mt: 1 }}>Danh sách trống</Box>
            </StyledGridOverlay>
        );
    }
    return (
        <Box
            // role="tabpanel"
            // hidden={value !== index}
            // id={`simple-tabpanel-${index}`}
            // aria-labelledby={`simple-tab-${index}`}
            sx={{
                height: '70vh',
                width: '100%',
                mt: '1rem',
                display: 'flex',
                flexDirection: 'column',
                // '& .role-edit:hover': {
                //     // backgroundColor: '#655151 !important',
                //     border: '1px dashed #655151',
                //     // content: "'\\270E'",
                //     // // color: 'red',
                //     // fontSize: '1.2rem',
                // },
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
                    // minWidth: '80px !important',
                },
                '& .status-rows.deactive': {
                    backgroundColor: '#ff3838',
                    color: '#fff',
                    fontWeight: '600',
                    // minWidth: '80px !important',
                },
            }}
        >
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Xác nhận</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">Bạn có muốn lưu các thay đổi ?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleUpdate} autoFocus>
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            {isEdit && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={handleOpenDialog} sx={{ m: 1 }}>
                        Lưu lại
                    </Button>
                </Box>
            )}
            <DataGrid
                // loading={data.length === 0}
                disableSelectionOnClick={true}
                rows={rowsUser}
                columns={columns}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[10, 20, 30]}
                components={{
                    Toolbar: CustomToolbar,
                    NoRowsOverlay: CustomNoRowsOverlay,
                }}
                // onCellEditCommit={handleRowEditCommit}
            />
        </Box>
    );
}

export default AdminList;
