import {
    Button,
    Collapse,
    Fab,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Box } from '@mui/system';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import EditExhibition from './EditExhibition';

function PerformanceCompetition(props) {
    const [datas, setDatas] = useState(props.data);
    const [isChecked, setIsChecked] = useState(false);
    const [dataEdit, setDataEdit] = useState();
    const [isEdit, setIsEdit] = useState(false);

    const validationSchema = Yup.object().shape({
        name: Yup.string().trim().required('Không được để trống trường này'),
        numberMale: Yup.number()
            .required('Không được để trống trường này')
            .typeError('Vui lòng nhập số')
            .min(0, 'Vui lòng nhập giá trị lớn hơn 0')
            .max(1000, 'Vui lòng nhập giá trị phù hợp thực tế'),
        numberFemale: Yup.number()
            .required('Không được để trống trường này')
            .typeError('Vui lòng nhập số')
            .min(0, 'Vui lòng nhập giá trị lớn hơn 0')
            .max(1000, 'Vui lòng nhập giá trị phù hợp thực tế'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setFocus,
        setError,
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    const handleEditCompetition = (data) => {
        const newData = datas.map((d) => (d.id == data.id ? data : d));
        setDatas(newData);
        props.onAddPerformanceCompetition(newData);
        handleCancel();
    };

    const handleAddCompetition = (data) => {
        if (props.data.findIndex((row) => row.name.toLowerCase() === data.name.toLowerCase()) >= 0) {
            setError('name', {
                message: `Tên thể thức ${data.name} này đã tồn tại, vui lòng chọn tên khác`,
            });
            return;
        }
        if (data.numberFemale == 0 && data.numberMale == 0) {
            setFocus('numberMale', { shouldSelect: true });
            setError('numberMale', { message: 'Số lượng nam và nữ không được bằng 0' });
            setError('numberFemale', { message: 'Số lượng nam và nữ không được bằng 0' });
        } else {
            const newInput = { ...data, id: Math.random() };
            const newData = [...datas, newInput];
            setDatas(newData);
            props.onAddPerformanceCompetition(newData);
            setIsChecked(!isChecked);
            reset({
                name: '',
                numberMale: '',
                numberFemale: '',
            });
        }
    };
    const handleCancel = () => {
        setIsChecked(!isChecked);
        isEdit && setIsEdit(false);
        reset({
            name: '',
            numberMale: '',
            numberFemale: '',
        });
    };

    const handleEdit = (data) => {
        // const newData = datas.filter((data) => {
        //     return data.id !== id;
        // });
        console.log(data);
        setDataEdit(data);
        setIsEdit(true);
        setIsChecked(!isChecked);
        // setDatas(newData);
        // props.onAddPerformanceCompetition(newData);
    };

    const handleDelete = (id) => {
        const newData = datas.filter((data) => {
            return data.id !== id;
        });
        setDatas(newData);
        props.onAddPerformanceCompetition(newData);
    };

    return (
        <Box>
            <Paper elevation={3} sx={{ width: '100%' }}>
                {props.data.length > 0 && (
                    <TableContainer sx={{ maxHeight: 440, m: 1, p: 1, mb: 2 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Nội dung thi đấu</TableCell>
                                    <TableCell align="center">Số lượng nữ</TableCell>
                                    <TableCell align="center">Số lượng nam</TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {datas.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell>{data.name}</TableCell>
                                        <TableCell align="center">{data.numberFemale}</TableCell>
                                        <TableCell align="center">{data.numberMale}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() => {
                                                    // handleOpenDialog();
                                                    handleEdit(data);
                                                }}
                                                disabled={
                                                    isEdit ||
                                                    isChecked ||
                                                    (data.exhibitionTeams && data.exhibitionTeams.length > 0)
                                                }
                                            >
                                                <Edit />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="delete"
                                                onClick={() => {
                                                    // handleOpenDialog();
                                                    handleDelete(data.id);
                                                }}
                                                disabled={
                                                    isEdit ||
                                                    isChecked ||
                                                    (data.exhibitionTeams && data.exhibitionTeams.length > 0)
                                                }
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
            <Paper elevation={3}>
                <Collapse in={isChecked}>
                    {!isEdit ? (
                        <Box sx={{ padding: 1 }}>
                            <TextField
                                id="outlined-error-helper-text fullWidth"
                                label="Tên nội dung"
                                {...register('name')}
                                error={errors.name ? true : false}
                                defaultValue=""
                                helperText={errors.name?.message}
                                required
                                fullWidth
                            />
                            <TextField
                                fullWidth
                                type="number"
                                id="outlined-basic"
                                label="Số lượng nam"
                                variant="outlined"
                                {...register('numberMale')}
                                error={errors.numberMale ? true : false}
                                helperText={errors.numberMale?.message}
                            />
                            <TextField
                                type="number"
                                id="outlined-basic"
                                label="Số lượng nữ"
                                variant="outlined"
                                {...register('numberFemale')}
                                error={errors.numberFemale ? true : false}
                                helperText={errors.numberFemale?.message}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleSubmit(handleAddCompetition)}
                                sx={{ m: 1 }}
                            >
                                Thêm
                            </Button>
                            <Button variant="contained" color="warning" onClick={handleCancel}>
                                Hủy
                            </Button>
                        </Box>
                    ) : (
                        dataEdit && (
                            <EditExhibition
                                dataEdit={dataEdit}
                                onEdit={handleEditCompetition}
                                onCancel={handleCancel}
                            />
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
                    Thêm nội dung biểu diễn
                </Fab>
            </Collapse>
        </Box>
    );
}

export default PerformanceCompetition;
