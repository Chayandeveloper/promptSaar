<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PromptController;
use App\Http\Controllers\Admin\RewardSettingController;
use App\Http\Controllers\Admin\UnlockController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Root → redirect to admin dashboard
|--------------------------------------------------------------------------
*/
Route::get('/', fn() => redirect()->route('admin.dashboard'));

Route::get('/login', fn() => redirect()->route('admin.login'))->name('login');

/*
|--------------------------------------------------------------------------
| Admin Auth Routes (unauthenticated)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

/*
|--------------------------------------------------------------------------
| Admin Protected Routes (session auth + admin role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', EnsureAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Prompts CRUD
        Route::get('/prompts', [PromptController::class, 'index'])->name('prompts.index');
        Route::get('/prompts/create', [PromptController::class, 'create'])->name('prompts.create');
        Route::post('/prompts', [PromptController::class, 'store'])->name('prompts.store');
        Route::get('/prompts/{id}/edit', [PromptController::class, 'edit'])->name('prompts.edit');
        Route::put('/prompts/{id}', [PromptController::class, 'update'])->name('prompts.update');
        Route::delete('/prompts/{id}', [PromptController::class, 'destroy'])->name('prompts.destroy');
        Route::post('/prompts/upload-image', [PromptController::class, 'uploadImage'])->name('prompts.upload-image');

        // Categories CRUD
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // Users & Coin Ledger Management
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users/{id}/adjust-coins', [UserController::class, 'adjustCoins'])->name('users.adjust-coins');

        // Push Notifications (Firebase / Expo)
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/send', [NotificationController::class, 'send'])->name('notifications.send');

        // Reward & Coin Settings
        Route::get('/settings/rewards', [RewardSettingController::class, 'index'])->name('settings.rewards');
        Route::put('/settings/rewards', [RewardSettingController::class, 'update'])->name('settings.rewards.update');

        // Unlock analytics
        Route::get('/unlocks', [UnlockController::class, 'index'])->name('unlocks.index');
    });
