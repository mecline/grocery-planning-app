import { Delete } from '@mui/icons-material';
import { Button, Card, Dialog, IconButton, Input, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import {
    createTheme, StyledEngineProvider, ThemeProvider
} from '@mui/material/styles';
import MaterialTable from 'material-table';
import React from 'react';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { backgroundColor, StyledAddBox, StyledSquareButton, textColor } from '../theme/MealPlannerTheme';
import IngredientModal from './IngredientModal';

const toolbar = createTheme({
    palette: {
        primary: {
            main: textColor,
        },
        secondary: {
            main: backgroundColor,
        },
    },

});

const QUANTITY_TEST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

class MealModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth.currentUser,
            mealTitle: props.mealTitle ? props.mealTitle : '',
            ingredients: props.ingredients ? props.ingredients : [],
            quantity: '',
            category: '',
            ingredientModal: false,
            isEditing: false,

        };
    }

    setMealTitle = (mealTitle) => {
        this.setState({ mealTitle: mealTitle });
    }

    setIngredients = (rowData) => {
        let filteredData = [];
        rowData.map((item) => {
            return filteredData.push({
                ingredientId: item.ingredientId,
                ingredientName: item.ingredientName,
                category: item.category,
                quantity: item.quantity ? item.quantity : 1,
                notes: item.notes
            });
        })
        this.setState({ ingredients: filteredData });
    }

    addIngredient = () => {
        this.setState({ ingredientModal: true, isEditing: true });
    }

    handleDeleteIngredient = (rowData) => {
        let snapshotList = [];
        firebaseDb.database().ref(`users/${this.state.user.uid}/ingredients/${rowData.ingredientId}`).remove();

        firebaseDb.database().ref(`users/${this.state.user.uid}/meals`).on('child_added', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                snapshotList.push(childSnapshot.val())
                if (Array.isArray(childSnapshot.val())) {
                    if (this.ingredientDeleteCheck(rowData.ingredientId, childSnapshot.val())) {
                        this.handleDeleteIngredientFromMeal(rowData.ingredientId, childSnapshot.val(), snapshot.key)
                    }
                }
            });
        });
    }

    ingredientDeleteCheck = (id, ingredientList) => {
        let checkUpdate = false;
        ingredientList.forEach((item) => {
            if (item.ingredientId === id) {
                checkUpdate = true;
            }
        })
        return checkUpdate;
    }

    handleDeleteIngredientFromMeal = (ingredientId, fullList, mealId) => {
        // handles deleting ingredients that have been attached to meals already
        let updatedIngredientList = fullList.filter(item => item.ingredientId !== ingredientId);

        // using .set as .update is deprecated for arrays being passed
        firebaseDb.database().ref(`users/${this.state.user.uid}/meals/${mealId}/ingredients`).set(
            updatedIngredientList
        )
    }

    handleModalClose = (modalForClose) => {
        this.setState({
            [modalForClose]: false,
            isEditing: false,
            ingredientId: '',
            ingredientName: '',
            category: '',
            notes: ''
        });
    }

    handleWriteIngredientData = (ingredientName, category, notes, ingredientId, multipleAdditions) => {
        if (!ingredientId) {
            this.props.db.ref(`users/${this.state.user.uid}/ingredients`).push({
                ingredientName: ingredientName,
                category: category ? category : '',
                notes: notes
            })
        }
        else if (ingredientId) {
            this.props.db.ref(`users/${this.state.user.uid}/ingredients/${ingredientId}`).update({
                ingredientName: ingredientName,
                category: category ? category : '',
                notes: notes
            })
        }

        !multipleAdditions && this.setState({ ingredientModal: false });
    }

    setQuantityForId = (event, rowData) => {
        let value = event.target.value;
        let newState = this.state.ingredients;

        newState.map((item) => {
            if (item.ingredientId === rowData.ingredientId) {
                item.quantity = value;
            }
            return this.state.ingredients;
        })
        this.setState({ ingredients: newState });
    }

    handleQuantity = (rowData) => {
        return (
            <Tooltip title={!rowData.tableData.checked ? "Item must be checked to add quantity" : ""}>
                <TextField
                    disabled={rowData.tableData.checked ? false : true}
                    select
                    variant="outlined"
                    value={rowData.quantity}
                    onChange={event => this.setQuantityForId(event, rowData, this.state.ingredients)}
                    input={<Input />}>
                    {QUANTITY_TEST.map((item) => {
                        return <MenuItem key={item} value={item}>{item}</MenuItem>
                    })}
                </TextField>
            </Tooltip>
        )
    }

    render() {
        const { db } = this.props;
        const { ingredients } = this.state;
        let ingredientsDbRef = db.ref(`users/${this.state.user.uid}/ingredients`);
        let tableData = [];
        let ingredientStateIds = ingredients.map((item) => { return item.ingredientName });
        const quantityMap = new Map();

        ingredients.map((item) => {
            return quantityMap.set(item.ingredientName, item.quantity);
        })

        ingredientsDbRef.on('child_added', function (snapshot) {
            tableData.push({
                ingredientId: snapshot.key,
                ingredientName: snapshot.val().ingredientName,
                category: snapshot.val().category,
                quantity: (ingredientStateIds.includes(snapshot.val().ingredientName)) ? quantityMap.get(snapshot.val().ingredientName) : '',
                notes: snapshot.val().notes,
                tableData: ingredientStateIds.includes(snapshot.val().ingredientName) ? { checked: true } : { checked: false }
            });
        })

        return (
            <div>
                <Card style={{ padding: '20px', minWidth: '80vh', minHeight: '75vh' }}>
                    <TextField style={{ marginRight: '15px' }} variant="outlined" label="Meal Title" required
                        value={this.state.mealTitle}
                        onInput={e => this.setMealTitle(e.target.value)}
                    />

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => this.addIngredient()} size="large">
                            <StyledAddBox />
                        </IconButton>
                        <Typography>Add Ingredient</Typography>
                    </div>
                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={toolbar}>
                            <div style={{ marginBottom: '20px' }}>
                                <MaterialTable
                                    title="Add Ingredients"
                                    columns={[
                                        { title: 'Name', field: 'ingredientName' },
                                        { title: 'Category', field: 'category' },
                                        { title: 'Quantity', field: 'quantity', render: (rowData) => this.handleQuantity(rowData, rowData.ingredientId) },
                                        { title: 'Notes', field: 'notes' },
                                    ]}
                                    data={tableData}
                                    options={{
                                        searching: true,
                                        selection: true,
                                        paging: false,
                                        maxBodyHeight: '45vh'
                                    }}
                                    actions={[
                                        {
                                            icon: () => <Delete />,
                                            tooltip: 'Delete',
                                            position: 'row',
                                            onClick: (event, rowData) => this.handleDeleteIngredient(rowData)
                                        }
                                    ]}
                                    onSelectionChange={(rows) => this.setIngredients(rows)}
                                />
                            </div>
                        </ThemeProvider>
                    </StyledEngineProvider>

                    < div style={{
                        position: 'absolute', right: 0, bottom: 0, margin: '15px'
                    }}>
                        <Button style={{ marginRight: '5px' }} onClick={() => this.props.closeCallback()}>Close</Button>
                        <StyledSquareButton
                            onClick={() => this.props.confirmCallback(this.state.mealTitle, this.state.ingredients, this.props.mealId)}>Save</StyledSquareButton>
                    </div>
                </Card>

                {
                    this.state.ingredientModal &&
                    <Dialog
                        open={this.state.ingredientModal}
                        onClose={() => this.handleModalClose('ingredientModal')}>
                        <IngredientModal
                            db={db}
                            closeCallback={() => this.handleModalClose('ingredientModal')}
                            confirmCallback={this.handleWriteIngredientData}
                            ingredientId={this.state.ingredientId}
                            ingredientName={this.state.ingredientName}
                            category={this.state.category}
                            notes={this.state.notes}
                        />
                    </Dialog>
                }
            </div >
        );
    }
}


export default MealModal;