import { Button, Card, Dialog, IconButton, TextField, Typography } from '@mui/material';
import React from 'react';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { StyledAddBox, StyledSquareButton } from '../theme/MealPlannerTheme';
import IngredientModal from './IngredientModal';
import IngredientChips from './IngredientChips';

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

    handleIngredientsChange = (updatedIngredients) => {
        this.setState({ ingredients: updatedIngredients });
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
                <Card style={{ 
                    padding: '20px', 
                    width: '90vw',
                    maxWidth: '1200px',
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <TextField 
                            style={{ marginRight: '15px', width: '300px' }} 
                            variant="outlined" 
                            label="Meal Title" 
                            required
                            value={this.state.mealTitle}
                            onInput={e => this.setMealTitle(e.target.value)}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                            <IconButton onClick={() => this.addIngredient()} size="large">
                                <StyledAddBox />
                            </IconButton>
                            <Typography>Add New Ingredient</Typography>
                        </div>
                    </div>

                    <div style={{ 
                        flex: 1, 
                        overflowY: 'auto',
                        marginBottom: '70px'
                    }}>
                        <IngredientChips
                            ingredients={tableData}
                            selectedIngredients={ingredients}
                            onIngredientsChange={this.handleIngredientsChange}
                        />
                    </div>

                    <div style={{
                        position: 'absolute', 
                        right: '0', 
                        bottom: '20px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                    }}>
                        <Button style={{ marginRight: '5px' }} onClick={() => this.props.closeCallback()}>Cancel</Button>
                        <StyledSquareButton
                            onClick={() => this.props.confirmCallback(this.state.mealTitle, this.state.ingredients, this.props.mealId)}>
                            Save Meal
                        </StyledSquareButton>
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