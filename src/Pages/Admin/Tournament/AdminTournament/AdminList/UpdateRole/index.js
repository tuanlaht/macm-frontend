import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
} from '@mui/material';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Add, Delete, Edit } from '@mui/icons-material';

import EditRole from './EditRole';
import adminTournament from 'src/api/adminTournamentAPI';
import { useSnackbar } from 'notistack';

function UpdateRole({ isOpen, handleClose, onSuccess, roleInTournament, roles, tournamentId, onChange }) {
    const newData =
        roleInTournament.length > 0
            ? roles.map((role) =>
                  roleInTournament.filter((ro) => ro.name === role.name).length > 0
                      ? roleInTournament.filter((ro) => ro.name === role.name)[0]
                      : { ...role, id: Math.floor(Math.random() * 1000) + 100 },
              )
            : roles;

    const { enqueueSnackbar } = useSnackbar();
    const [datas, setDatas] = useState(newData);
    const [dataEdit, setDataEdit] = useState();
    const [isEdit, setIsEdit] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const editRoleTournament = async (tournamentId, params) => {
        try {
            const response = await adminTournament.editRoleTournament(tournamentId, params);
            enqueueSnackbar(response.message, { variant: 'success' });
            onChange && onChange();
        } catch (error) {
            console.warn('Failed to edit role');
        }
    };

    useEffect(() => {
        const newData =
            roleInTournament.length > 0
                ? roles.map((role) =>
                      roleInTournament.filter((ro) => ro.name === role.name).length > 0
                          ? roleInTournament.filter((ro) => ro.name === role.name)[0]
                          : { ...role, id: Math.floor(Math.random() * 1000) + 100 },
                  )
                : roles;
        setDatas(newData);
    }, [roleInTournament, roles]);

    const validationSchema = Yup.object().shape({
        roleName: Yup.string()
            .trim()
            .nullable()
            .required('Không được để trống trường này')
            .test('len', 'Không hợp lệ', (val) => val && val.length > 1)
            .matches(
                /^[a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/,
                'Không hợp lệ: vui lòng nhập chữ',
            ),
        maxQuantity: Yup.number()
            .nullable()
            .required('Không được để trống trường này')
            .min(1, 'Vui lòng nhập giá trị lớn hơn 0')
            .max(1000, 'Số lượng không hợp lệ')
            .typeError('Không được để trống trường này'),
    });
    const {
        register,
        handleSubmit,
        resetField,
        setError,
        formState: { errors, isDirty, isValid },
    } = useForm({
        resolver: yupResolver(validationSchema),

        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const handleCancel = () => {
        setIsChecked(!isChecked);
        isEdit && setIsEdit(false);

        resetField('roleName', { keepError: true });
        resetField('maxQuantity', { keepError: true });
    };

    const handleSelectRole = (data) => {
        setDatas(datas.map((d) => (d.id === data.id ? { ...d, selected: !d.selected } : d)));
    };

    const handleDelete = (id) => {
        // datas.map((data) => {
        //     return data.id === id;
        // });
        setDatas((prevRows) => prevRows.filter((item) => item.id !== id));
    };

    const handleEdit = (role) => {
        // datas.map((data) => {
        //     return data.id === id;
        // });
        const dataEdit = datas.filter((item) => item.id === role.id);
        setDataEdit(dataEdit[0]);
        setIsEdit(true);
        setIsChecked(!isChecked);
    };
    const handleAddEventRoles = (data) => {
        if (datas.findIndex((d) => d.name.toLowerCase() === data.roleName.toLowerCase()) >= 0) {
            setError('roleName', {
                message: 'Vai trò này đã tồn tại, vui lòng chọn vai trò khác',
            });
            return;
        }

        const newData = [
            ...datas,
            {
                id: Math.random(),
                name: data.roleName,
                maxQuantity: data.maxQuantity,
                availableQuantity: data.maxQuantity,
                selected: true,
            },
        ];
        setDatas(newData);

        /**
         * Reset field keep error (isValid)
         */

        resetField('roleName', { keepError: true });
        resetField('maxQuantity', { keepError: true });

        setIsChecked(!isChecked);
    };

    const handleEditEventRoles = (data) => {
        // if (datas.findIndex((d) => d.name.toLowerCase().includes(data.roleName.toLowerCase())) >= 0) {
        //     setError('roleName', {
        //         message: `Vai trò ${data.roleName} này đã tồn tại, vui lòng chọn vai trò khác`,
        //     });
        //     return;
        // }
        if (
            datas.findIndex((d) => d.name.includes(data.roleName)) >= 0 &&
            datas.findIndex((d) => d.maxQuantity == data.maxQuantity) >= 0
        ) {
            setError('maxQuantity', {
                message: 'Số lượng sau chỉnh sửa không thay đổi',
            });
            return;
        }

        const newData = datas.map((role) =>
            role.id == data.id
                ? {
                      ...role,
                      maxQuantity: data.maxQuantity,
                      availableQuantity: data.availableQuantity,
                  }
                : role,
        );
        setDatas(newData);
        /**
         * Reset field keep error (isValid)
         */

        resetField('roleName', { keepError: true });
        resetField('maxQuantity', { keepError: true });

        isEdit && setIsEdit(false);
        setIsChecked(!isChecked);
    };
    const handleRegister = (data) => {
        const newData = datas.filter((data) => data.selected);
        const submitData =
            newData.length > 0
                ? newData.map((data) => {
                      return { name: data.name, maxQuantity: data.maxQuantity };
                  })
                : [];
        editRoleTournament(tournamentId, submitData);
        handleClose && handleClose();
    };
    const handleCloseDialog = () => {
        setDatas(datas);
        handleClose && handleClose();
    };
    return (
        <Dialog
            open={!!isOpen}
            onClose={handleClose}
            // fullWidth
            // maxWidth="lg"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Chỉnh sửa vai trò trong ban tổ chức</DialogTitle>
            <DialogContent sx={{ overflowY: 'unset' }}>
                {datas && datas.length > 0 && (
                    <TableContainer sx={{ maxHeight: 300, m: 1, p: 1 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <caption style={{ captionSide: 'top' }}>Số lượng vai trò hiện tại : {datas.length}</caption>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center">Tên vai trò</TableCell>
                                    <TableCell align="center">Số lượng thành viên</TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {datas.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell align="center">
                                            <Checkbox
                                                checked={data.selected}
                                                onChange={() => handleSelectRole(data)}
                                                disabled={
                                                    isEdit ||
                                                    // (data.availableQuantity &&
                                                    data.availableQuantity != data.maxQuantity
                                                }
                                            />
                                        </TableCell>
                                        <TableCell align="center">{data.name}</TableCell>
                                        <TableCell align="center">
                                            {data.selected
                                                ? data.maxQuantity - data.availableQuantity + '/' + data.maxQuantity
                                                : ''}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="edit"
                                                onClick={() => {
                                                    // handleOpenDialog();
                                                    handleEdit(data);
                                                }}
                                                disabled={isEdit || isChecked}
                                            >
                                                <Edit />
                                            </IconButton>
                                        </TableCell>
                                        {/* <TableCell>
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() => {
                                                    // handleOpenDialog();
                                                    handleDelete(data.id);
                                                }}
                                                disabled={
                                                    isEdit ||
                                                    (data.availableQuantity &&
                                                        data.availableQuantity != data.maxQuantity)
                                                }
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <Paper elevation={3}>
                    <Collapse in={isChecked}>
                        {!isEdit ? (
                            <Grid container spacing={2} sx={{ p: 2 }}>
                                <Grid item xs={12} container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            id="outlined-basic"
                                            label="Tên vai trò"
                                            variant="outlined"
                                            fullWidth
                                            {...register('roleName')}
                                            error={errors.roleName ? true : false}
                                            helperText={errors.roleName?.message}
                                        />
                                        {/* )} */}
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="Số lượng"
                                            type="number"
                                            id="outlined-basic"
                                            variant="outlined"
                                            fullWidth
                                            {...register('maxQuantity')}
                                            error={errors.maxQuantity ? true : false}
                                            helperText={errors.maxQuantity?.message}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit(handleAddEventRoles)}
                                        sx={{ mr: 1 }}
                                    >
                                        Thêm
                                    </Button>
                                    <Button variant="contained" color="error" onClick={handleCancel}>
                                        Hủy
                                    </Button>
                                </Grid>
                            </Grid>
                        ) : (
                            dataEdit && (
                                <EditRole roleEdit={dataEdit} onEdit={handleEditEventRoles} onCancel={handleCancel} />
                            )
                        )}
                    </Collapse>
                </Paper>
                <Collapse in={!isChecked}>
                    <Fab
                        color="primary"
                        variant="extended"
                        aria-label="add"
                        onClick={() => setIsChecked(!isChecked)}
                        size="medium"
                    >
                        <Add />
                        Thêm vai trò
                    </Fab>
                </Collapse>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={handleCloseDialog}>
                    Hủy
                </Button>
                <Button variant="contained" onClick={handleRegister} autoFocus disabled={datas && datas.length === 0}>
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default UpdateRole;
