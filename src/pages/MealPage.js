import { Dialog, IconButton, Typography } from '@mui/material';
import { AddBox, Delete, Edit } from '@mui/icons-material';
import MaterialTable from 'material-table';
import React from 'react';
import MealModal from '../components/MealModal';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { ThemeProvider, createTheme } from '@mui/material';

class MealPage extends React.Component {
    constructor() {
        super();
        this.state = {
            user: auth.currentUser,
            mealId: '',
            mealTitle: '',
            newMealTitle: '',
            ingredients: [],
            testList: null,
            isEditing: false
        };
    }

    componentDidMount() {
        firebaseDb.database().ref().orderByChild(`users/${this.state.user.uid}`).on('value', snap => {
            this.setState({
                testList: snap
            });
        });
    }

    setNewMealTitle = (newMealTitle) => {
        this.setState({ newMealTitle: newMealTitle });
    }

    handleWriteMealData = (mealTitle, ingredients, mealId) => {
        let uid = this.state.user.uid;
        if (!mealId) {
            firebaseDb.database().ref(`users/${uid}/meals`).push({
                mealTitle: mealTitle,
                ingredients: ingredients
            })
        }
        else if (mealId) {
            firebaseDb.database().ref(`users/${uid}/meals/${mealId}`).update({
                mealTitle: mealTitle,
                ingredients: ingredients
            })
        }
        this.setState({ mealModal: false });
    }

    handleMealModal = () => {
        this.setState({ mealModal: true });
    }

    handleModalClose = (modalForClose) => {
        this.setState({
            [modalForClose]: false,
            isEditing: false,
            mealId: '',
            mealTitle: '',
            ingredients: []
        });
    }

    handleDeleteMeal = (rowData) => {
        let selectedMealIds = [];
        firebaseDb.database().ref(`users/${this.state.user.uid}/meals/${rowData.mealId}`).remove();

        firebaseDb.database().ref(`users/${this.state.user.uid}/selectedMeals`).on('child_added', (snap) => {
            let selectedMeal = snap.val();
            if (selectedMeal !== rowData.mealId) {
                selectedMealIds.push(selectedMeal);
            }
        })

        firebaseDb.database().ref(`users/${this.state.user.uid}`).update({
            selectedMeals: selectedMealIds
        })
    }

    handleEditMeal = (rowData) => {
        this.setState({
            isEditing: true,
            mealId: rowData.mealId,
            mealTitle: rowData.mealTitle,
            ingredients: rowData.ingredients,
            mealModal: true
        })
    }

    customTableRender = (rowData, db) => {
        let ingredients = [];

        // if throwing error 'Object not valid for .equalTo' make sure a quantity is coming through, predefined as 1
        rowData.ingredients && rowData.ingredients.map((item) => {
            return db.ref(`users/${this.state.user.uid}/ingredients`).orderByChild("ingredientName").equalTo(item.ingredientName).on('child_added', (snapshot) => {
                ingredients.push(snapshot.val().ingredientName);
            });
        })

        let customRowData = '';
        if (ingredients) {
            ingredients.map((item, index) => {
                return customRowData += (item + (index !== (ingredients.length - 1) ? ', ' : ' '));
            })
            return customRowData;
        }
        return customRowData;
    }

    getQuantityState = (ingredients) => {
        this.setState({ ingredients: ingredients });
    }

    render() {
        const { classes } = this.props;
        const defaultMaterialTheme = createTheme();
        const db = firebaseDb.database();
        let mealsDbRef = db.ref(`users/${this.state.user.uid}/meals`);
        let tableData = [];

        mealsDbRef.on('child_added', function (snapshot) {
            tableData.push({
                mealId: snapshot.key,
                mealTitle: snapshot.val().mealTitle,
                ingredients: snapshot.val().ingredients
            });
        })

        return (
            <div style={{ padding: '50px' }}>
                <ThemeProvider theme={defaultMaterialTheme}>
                    <MaterialTable
                        title="Meal List"
                        columns={[
                            { title: 'Meal Title', field: 'mealTitle' },
                            {
                                field: 'ingredients', headerName: 'Ingredients', width: 130,
                                render: (rowData) => this.customTableRender(rowData, db)
                            },
                        ]}
                        data={tableData}
                        options={{
                            searching: true,
                            maxBodyHeight: '400',
                            paging: false
                        }}
                        actions={[
                            {
                                icon: () => <Edit />,
                                tooltip: 'Edit',
                                onClick: (event, rowData) => this.handleEditMeal(rowData)
                            },
                            {
                                icon: () => <Delete />,
                                tooltip: 'Delete',
                                onClick: (event, rowData) => this.handleDeleteMeal(rowData)
                            }
                        ]}
                    />
                </ThemeProvider>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => this.handleMealModal()} size="large">
                        <AddBox />
                    </IconButton>
                    <Typography>Add Meal</Typography>
                </div>

                {this.state.mealModal &&
                    <Dialog
                        open={this.state.mealModal}
                        onClose={() => this.handleModalClose('mealModal')}>
                        <MealModal
                            db={db}
                            closeCallback={() => this.handleModalClose('mealModal')}
                            confirmCallback={this.handleWriteMealData}
                            mealId={this.state.mealId}
                            mealTitle={this.state.mealTitle}
                            ingredients={this.state.ingredients}
                        />
                    </Dialog>}
            </div>
        );
    }
}

export default MealPage;