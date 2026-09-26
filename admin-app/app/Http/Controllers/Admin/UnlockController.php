<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromptUnlock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UnlockController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PromptUnlock::with('prompt.category');

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->whereHas('prompt', fn($q) => $q->where('title', 'like', $term));
        }

        $unlocks = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Unlocks/Index', [
            'unlocks' => $unlocks,
            'filters' => $request->only(['search']),
            'admin'   => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }
}
