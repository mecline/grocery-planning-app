import { Button, Dialog, IconButton, Typography } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import React from 'react';
import ListModal from '../components/ListModal.js';
import { auth, firebaseDb } from '../firebase/firebase.js';
import { backgroundColor, textColor } from '../theme/MealPlannerTheme';

class ListPage extends React.Component {
    constructor() {
        super();
        this.state = {
            user: auth.currentUser,
            notesEnabled: false
        };
    }

    handleSelectMeals = () => {
        this.setState({ listModal: true });
    }

    handleNotesEnabled = () => {
        this.setState({ notesEnabled: !this.state.notesEnabled });
    }

    handleModalClose = (modalForClose) => {
        this.setState({
            [modalForClose]: false,
        });
    }

    handleSaveSelectedMeals = (selectedMeals) => {
        let uid = this.state.user.uid;
        let selectedMealTitles = selectedMeals.map((meal) => { return meal.mealId ? meal.mealId : meal });

        firebaseDb.database().ref(`users/${uid}`).update({
            selectedMeals: selectedMealTitles
        })

        this.setState({ listModal: false });
    }

    handleDuplicateIngredients = (ingredientsList) => {
        let ingredientDuplicateCheck = [];
        let quantityMap = new Map();
        let newList = [];
        let quantityExisting = 0;

        ingredientsList.forEach((item) => {
            if (ingredientDuplicateCheck.includes(item.ingredientId)) {
                if (quantityMap.has(item.ingredientId)) {
                    quantityExisting = quantityMap.get(item.ingredientId) + item.quantity;
                    quantityMap.set(item.ingredientId, quantityExisting);
                }
                else {
                    quantityMap.set(item.ingredientId, item.quantity);
                }
            }
            else {
                ingredientDuplicateCheck.push(item.ingredientId);
                newList.push(item)
            }
        })

        quantityMap.forEach(function (value, key) {
            newList.map((item) => {
                if (key === item.ingredientId) {
                    item.quantity += value
                }
                return newList;
            })
        })
        return newList;
    }

    displayListContents = (item, categoryFlag, classes) => {
        return (
            <React.Fragment key={item.ingredientId}>
                <div>
                    {categoryFlag && item.category}
                </div>
                <div>
                    {item.quantity > 1 ? '(' + item.quantity + ') ' : null}{item.ingredientName}
                </div>
                <div>
                    {this.state.notesEnabled && item.notes ? " Notes: " + item.notes : null}
                </div>
            </React.Fragment>
        )
    }

    render() {
        const { classes } = this.props;
        let db = firebaseDb.database();
        let selectedDbRef = db.ref(`users/${this.state.user.uid}/selectedMeals`);
        let selectedMeals = [];
        let shoppingList = [];
        let ingredientsList = [];
        let mealTitles = [];

        selectedDbRef.on('child_added', (snapshot) => {
            selectedMeals.push(snapshot.val());
        });

        // Getting the meal object from the user's meal collection if the meal is selected
        // Adds meal to shoppingList if it is found, so shoppingList now can access ingredients
        firebaseDb.database().ref(`users/${this.state.user.uid}/meals`).on('child_added', (snap) => {
            let meal = snap.key;
            if (~selectedMeals.indexOf(meal)) {
                mealTitles.push(snap.val().mealTitle)
                shoppingList.push(snap.val())
            }
        })

        shoppingList.map((listItem) => {
            return listItem.ingredients && listItem.ingredients.forEach((item) => {
                ingredientsList.push(item);
            })
        })

        ingredientsList = this.handleDuplicateIngredients(ingredientsList);

        return (
            <div>
                <Typography>Meals:</Typography>
                Enable Notes
                <IconButton onClick={() => this.handleNotesEnabled()} size="large">
                    {this.state.notesEnabled ? <CheckBox /> : <CheckBoxOutlineBlank />}
                </IconButton>
                <Button onClick={() => this.handleSelectMeals()}>Add Meal</Button>
                {mealTitles.map((meal) => {
                    return <div key={meal} style={{
                        display: 'inline-block', borderRadius: '15px', backgroundColor: backgroundColor, color: textColor,
                        width: 'fit-content', padding: '0px 10px', marginLeft: '5px', marginBottom: '5px'
                    }}>
                        {meal}
                    </div>
                })}

                {/* Sorting the different ingredients by categories for display */}
                {ingredientsList.sort((a, b) => a.category > b.category ? 1 : -1).map((item, i) => {
                    if (i === 0) {
                        return this.displayListContents(item, true, classes);
                    }
                    else {
                        let prevItem = ingredientsList[i - 1];
                        if (prevItem.category !== item.category) {
                            return this.displayListContents(item, true, classes); // true flag for category name posting
                        }
                        else if (prevItem.category === item.category) {
                            return this.displayListContents(item, false, classes);
                        }
                    }
                    return ingredientsList;
                })}

                {this.state.listModal &&
                    <Dialog
                        open={this.state.listModal}
                        onClose={() => this.handleModalClose('listModal')}>
                        <ListModal
                            db={db}
                            selectedMeals={selectedMeals}
                            closeCallback={() => this.handleModalClose('listModal')}
                            confirmCallback={this.handleSaveSelectedMeals}
                        />
                    </Dialog>}
            </div>
        );
    }
}

export default ListPage;