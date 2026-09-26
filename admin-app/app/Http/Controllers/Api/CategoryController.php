<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('status', 'active')
            ->withCount(['prompts' => fn($q) => $q->where('is_published', true)])
            ->orderBy('name')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->withCount(['prompts' => fn($q) => $q->where('is_published', true)])
            ->firstOrFail();

        return response()->json(['category' => $category]);
    }
}
