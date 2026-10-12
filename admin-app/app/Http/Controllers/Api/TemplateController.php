<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Template::active();

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('description', 'like', $search)
                  ->orWhere('category', 'like', $search);
            });
        }

        if ($request->get('filter') === 'featured') {
            $query->where('is_featured', true);
        } elseif ($request->get('filter') === 'popular') {
            $query->orderBy('use_count', 'desc');
        }

        $templates = $query->paginate($request->get('per_page', 20));

        // Get unique categories with count
        $categories = Template::where('is_active', true)
            ->select('category')
            ->selectRaw('count(*) as count')
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json([
            'status'     => 'ok',
            'data'       => $templates->items(),
            'total'      => $templates->total(),
            'current_page' => $templates->currentPage(),
            'last_page'  => $templates->lastPage(),
            'categories' => $categories,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $template = Template::findOrFail($id);
        $template->increment('views_count');

        return response()->json([
            'status'   => 'ok',
            'template' => $template,
        ]);
    }

    public function useTemplate(int $id): JsonResponse
    {
        $template = Template::findOrFail($id);
        $template->increment('use_count');

        return response()->json([
            'status'     => 'ok',
            'use_count'  => $template->use_count,
            'capcut_url' => $template->capcut_url,
        ]);
    }
}
