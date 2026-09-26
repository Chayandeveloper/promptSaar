<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Prompt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PromptController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Prompt::with('category');

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(fn($q) => $q->where('title', 'like', $term)->orWhere('description', 'like', $term));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $query->where('is_published', $request->status === 'published');
        }

        $prompts    = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('Prompts/Index', [
            'prompts'    => $prompts,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'category_id', 'status']),
            'admin'      => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function create(): Response
    {
        $categories = Category::where('status', 'active')->orderBy('name')->get(['id', 'name', 'slug', 'icon']);
        $defaultCost = (int) \App\Models\RewardSetting::get('default_prompt_cost', 30);

        return Inertia::render('Prompts/Create', [
            'categories'  => $categories,
            'defaultCost' => $defaultCost,
            'admin'       => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function store(Request $request)
    {
        $defaultCost = (int) \App\Models\RewardSetting::get('default_prompt_cost', 30);

        $validated = $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'prompt_text'  => 'required|string',
            'cover_image'  => 'required|string',
            'unlock_cost'  => 'nullable|integer|min:0|max:10000',
            'tags'         => 'nullable|array',
            'tags.*'       => 'string|max:50',
            'is_featured'  => 'boolean',
            'is_trending'  => 'boolean',
            'is_published' => 'boolean',
        ]);

        $slug     = Str::slug($validated['title']);
        $baseSlug = $slug;
        $counter  = 1;
        while (Prompt::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        Prompt::create([
            ...$validated,
            'slug'         => $slug,
            'unlock_cost'  => $validated['unlock_cost'] ?? $defaultCost,
            'tags'         => $validated['tags'] ?? [],
            'is_featured'  => $validated['is_featured'] ?? false,
            'is_trending'  => $validated['is_trending'] ?? false,
            'is_published' => $validated['is_published'] ?? true,
            'views'        => 0,
            'unlock_count' => 0,
        ]);

        return redirect()->route('admin.prompts.index')->with('success', 'Prompt created successfully!');
    }

    public function edit(int $id): Response
    {
        $prompt     = Prompt::with('category')->findOrFail($id);
        $categories = Category::where('status', 'active')->orderBy('name')->get(['id', 'name', 'slug', 'icon']);

        return Inertia::render('Prompts/Edit', [
            'prompt'     => $prompt,
            'categories' => $categories,
            'admin'      => Auth::user()->only('name', 'email', 'avatar'),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $prompt = Prompt::findOrFail($id);

        $validated = $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'prompt_text'  => 'required|string',
            'cover_image'  => 'required|string',
            'unlock_cost'  => 'required|integer|min:0|max:10000',
            'tags'         => 'nullable|array',
            'tags.*'       => 'string|max:50',
            'is_featured'  => 'boolean',
            'is_trending'  => 'boolean',
            'is_published' => 'boolean',
        ]);

        // Re-slug only if title changed
        if ($validated['title'] !== $prompt->title) {
            $slug     = Str::slug($validated['title']);
            $baseSlug = $slug;
            $counter  = 1;
            while (Prompt::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        $prompt->update($validated);

        return redirect()->route('admin.prompts.index')->with('success', 'Prompt updated successfully!');
    }

    public function destroy(int $id)
    {
        Prompt::findOrFail($id)->delete();

        return redirect()->route('admin.prompts.index')->with('success', 'Prompt deleted successfully!');
    }

    public function uploadImage(Request $request)
    {
        $request->validate(['image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120']);

        $path = $request->file('image')->store('prompts', 'public');

        return response()->json(['url' => asset('storage/' . $path)]);
    }
}
