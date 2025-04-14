import { Dialog, IconButton, Typography, Chip, Box } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import MaterialTable from 'material-table';
import React from 'react';
import MealModal from '../components/MealModal';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { ThemeProvider, createTheme, Container } from '@mui/material';
import { StyledAddBox, textColor, backgroundColor } from '../theme/MealPlannerTheme';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

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

    renderIngredientChips = (rowData, db) => {
        if (!rowData.ingredients || rowData.ingredients.length === 0) {
            return <span>No ingredients</span>;
        }

        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {rowData.ingredients.map((ingredient, index) => (
                    <Chip
                        key={index}
                        label={
                            <span>
                                {ingredient.quantity > 1 && 
                                    <span style={{ marginRight: '4px' }}>
                                        ({ingredient.quantity})
                                    </span>
                                }
                                {ingredient.ingredientName}
                            </span>
                        }
                        size="small"
                        sx={{
                            backgroundColor: backgroundColor,
                            color: textColor,
                            margin: '2px',
                            maxWidth: '150px',
                            '& .MuiChip-label': {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }}
                    />
                ))}
            </Box>
        );
    }

    getQuantityState = (ingredients) => {
        this.setState({ ingredients: ingredients });
    }

    render() {
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
                <Container style={{ backgroundColor: 'white', borderRadius: '10px ', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography style={{ padding: '20px', color: textColor }}>Meals</Typography>
                        <IconButton onClick={() => this.handleMealModal()} size="large">
                            <StyledAddBox sx={{ color: textColor }} />
                        </IconButton>
                        <Typography style={{ color: textColor }}>Add Meal</Typography>
                    </div>
                    <ThemeProvider theme={defaultMaterialTheme}>
                        <MaterialTable
                            title={null}
                            columns={[
                                { 
                                    title: 'Meal Title', 
                                    field: 'mealTitle',
                                    width: '25%', 
                                },
                                {
                                    title: 'Ingredients', 
                                    field: 'ingredients', 
                                    width: '75%', 
                                    render: (rowData) => this.renderIngredientChips(rowData, db)
                                },
                            ]}
                            data={tableData}
                            options={{
                                searching: true,
                                maxBodyHeight: '80vh',
                                paging: false,
                                actionsColumnIndex: -1,
                                headerStyle: {
                                    backgroundColor: 'white',
                                    color: textColor,
                                    fontWeight: 'bold'
                                },
                                rowStyle: {
                                    color: textColor
                                },
                                searchFieldStyle: {
                                    color: textColor
                                }
                            }}
                            icons={{
                                Search: SearchIcon,
                                ResetSearch: ClearIcon
                            }}
                            actions={[
                                {
                                    icon: () => <Edit sx={{ color: textColor }}/>,
                                    tooltip: 'Edit',
                                    onClick: (event, rowData) => this.handleEditMeal(rowData)
                                },
                                {
                                    icon: () => <Delete sx={{ color: textColor }}/>,
                                    tooltip: 'Delete',
                                    onClick: (event, rowData) => this.handleDeleteMeal(rowData)
                                }
                            ]}
                        />
                    </ThemeProvider>
                </Container>

                {this.state.mealModal &&
                    <Dialog
                        open={this.state.mealModal}
                        onClose={() => this.handleModalClose('mealModal')}
                        maxWidth={false}
                    >
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